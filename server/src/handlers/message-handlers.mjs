import { Group } from '../models/group-model.mjs';
import { GroupMember } from '../models/group-member-model.mjs';
import { PrivateChat } from '../models/private-chat-model.mjs';
import { Message } from '../models/message-model.mjs';
import isSenderBlocked from '../utils/check-blocked-status.mjs';

const handleChatMessages = (socket, io) => {
	socket.on('chat-message', async (data, clientOffset, callback) => {
		const { username, chatId, message, room, chatType } = data;
		const senderId = socket.handshake.session.passport.user;

		try {
			// Check if sender is blocked
			await checkIfBlocked(chatId, senderId);

			const newMessage = await saveMessageInDatabase(
				message,
				senderId,
				chatId,
				room,
				chatType,
				clientOffset
			);

			restoreRecipientChat(chatId, room, chatType);
			broadcastMessage(
				io,
				room,
				username,
				message,
				senderId,
				newMessage,
				chatType
			);
			broadcastChatListUpdate(io, room, message, newMessage);
		} catch (error) {
			console.error('Error handling chat message:', error);
			if (error.message === 'Sender is blocked by the recipient') {
				callback(
					'You cannot send messages to this user because they have you blocked'
				);
			}
			callback('Error sending message');
		}
	});
};

// Load all messages of a chat when opened
const displayChatMessages = async (socket, room) => {
	if (!socket.recovered) {
		try {
			// Get messages from database for display, filtered by room
			const messages = await Message.retrieveMessageList(
				socket.handshake.auth.serverOffset,
				room
			);
			socket.emit('initial-messages', messages.map(formatMessage));
		} catch (error) {
			console.error('Unable to retrieve chat messages:', error);
			socket.emit('custom-error', {
				error: 'Unable to retrieve chat messages',
			});
			return;
		}
	}
};

// Handle sending updated last message info for the chat list after a delete or edit
const updateMostRecentMessage = (socket, io) => {
	socket.on('last-message-updated', async (room) => {
		try {
			const lastMessageInfo = await Message.retrieveLastMessageInfo(room);
			io.to(room).emit('last-message-updated', {
				room: room,
				lastMessageContent: lastMessageInfo ? lastMessageInfo.content : null,
				lastMessageTime: lastMessageInfo ? lastMessageInfo.event_time : null,
			});
		} catch (error) {
			console.error('Error updating chat list:', error);
			socket.emit('custom-error', {
				error: `There was an error updating your chat list. Please refresh the page.`,
			});
			return;
		}
	});
};

// TODO: Don't retrieve the whole message list after a message is deleted or edited - optimise it
// Listen for message deletes and edits, and emit the updated message list to the relevant room
const updateMessageListEvent = (socket, io) => {
	socket.on('message-list-update-event', async (room, updateType) => {
		try {
			const messages = await Message.retrieveMessageList(
				socket.handshake.auth.serverOffset,
				room
			);
			io.to(room).emit('message-list-update-event', {
				room: room,
				updatedMessageList: messages.map(formatMessage),
			});
		} catch (error) {
			console.error('Unexpected error:', error);
			socket.emit('custom-error', {
				error: `Error ${updateType} message. Please try again.`,
			});
			return;
		}
	});
};

const formatMessage = (message) => ({
	from: message.sender_username,
	content: message.content,
	eventTime: message.event_time,
	id: message.message_id,
	senderId: message.sender_id,
	isEdited: message.is_edited,
});

const checkIfBlocked = async (chatId, senderId) => {
	try {
		await isSenderBlocked(chatId, senderId);
	} catch (error) {
		throw error;
	}
};

// Handlers for chat-type-specific operations, allows for polymorphic behaviour at runtime
const CHAT_HANDLERS = {
	chats: {
		getMembers: async (room) => {
			try {
				const members = await PrivateChat.retrieveMembersByRoom(room);
				return Object.values(members);
			} catch (error) {
				throw new Error('Unable to retrieve private chat members:', {
					cause: error,
				});
			}
		},
		postInsert: async (_senderId, newMessageId, chatId, room) => {
			try {
				await PrivateChat.updateUserReadStatus(chatId, false, room);
				await PrivateChat.updateLastMessage(newMessageId, room);
			} catch (error) {
				throw new Error('Unable to update private chat metadata:', {
					cause: error,
				});
			}
		},
	},
	groups: {
		getMembers: async (room) => {
			try {
				const members = await GroupMember.retrieveMembersByRoom(room);
				return members.map((member) => member.user_id);
			} catch (error) {
				throw new Error('Unable to retrieve group chat members', {
					cause: error,
				});
			}
		},
		postInsert: async (senderId, newMessageId, _chatId, room) => {
			try {
				await Group.resetReadByList([senderId], room);
				await Group.updateLastMessage(newMessageId, room);
			} catch (error) {
				throw new Error('Unable to update group chat metadata', {
					cause: error,
				});
			}
		},
	},
};

const saveMessageInDatabase = async (
	message,
	senderId,
	chatId,
	room,
	chatType,
	clientOffset
) => {
	let newMessage;

	try {
		const chatHandler = CHAT_HANDLERS[chatType];

		// Prevent unauthorised users from sending messages to chat rooms they are not a part of
		const memberIds = await chatHandler.getMembers(room);
		if (!memberIds.includes(senderId)) {
			throw new Error('User is not authorised to send messages in this chat');
		}

		newMessage = await Message.insertNewMessage(
			message,
			senderId,
			chatId,
			room,
			clientOffset
		);

		await chatHandler.postInsert(senderId, newMessage.id, chatId, room);
		return newMessage;
	} catch (error) {
		if (newMessage) {
			await Message.deleteMessageById(newMessage.id);
		}
		if (error.errno === 19) {
			console.error(
				'Message with this client offset already exists:',
				clientOffset
			);
		}
		throw error;
	}
};

// Mark the recipient's chat as not deleted in the database on incoming message if it was previously marked as deleted
const restoreRecipientChat = async (recipientId, room, chatType) => {
	if (chatType === 'chats') {
		const isNotInChatList = await PrivateChat.retrieveChatDeletionStatus(
			recipientId,
			room
		);
		if (isNotInChatList === true) {
			await PrivateChat.updateChatDeletionStatus(recipientId, false, room);
		}
	}
};

const broadcastMessage = (
	io,
	room,
	username,
	message,
	senderId,
	newMessage,
	chatType
) => {
	io.to(room).emit('chat-message', {
		from: username,
		content: message,
		room: room,
		eventTime: newMessage.event_time,
		id: newMessage.id,
		senderId: senderId,
		chatType: chatType,
	});
};

// Update the chat's preview info in the chat list for everyone in the room
const broadcastChatListUpdate = (io, room, message, newMessage) => {
	io.to(room).emit('update-chat-list', {
		room: room,
		lastMessageContent: message,
		lastMessageTime: newMessage.event_time,
		deleted: false,
	});
};

export {
	handleChatMessages,
	displayChatMessages,
	updateMostRecentMessage,
	updateMessageListEvent,
};
