import { PrivateChat } from '../../../models/private-chat-model.mjs';
import { User } from '../../../models/user-model.mjs';
import { getChatListByUserId } from './get-chat-controller.mjs';
import { v4 as uuidv4 } from 'uuid';

// Handle adding a chat (new or previously added but deleted) to a user's chat list
const addChat = async (req, res) => {
	try {
		const { senderId, recipientId } = await getChatRoomData(req);
		const room = await PrivateChat.retrieveRoomByMembers(senderId, recipientId);

		// This check is needed to know whether to insert a new chat in the database and mark it as not deleted or to only do the latter
		// All chats are marked as deleted by default to prevent incorrectly displaying them in a user's chat list
		if (room === null) {
			const newRoom = uuidv4();
			await PrivateChat.insertNewChat(senderId, recipientId, newRoom);
			await PrivateChat.updateChatDeletionStatus(senderId, false, newRoom);
		} else {
			await PrivateChat.updateChatDeletionStatus(senderId, false, room);
		}
		// TODO: Find a more optimised way to update the chat list with the added chat,
		// rather than retrieving the whole chat list each time
		const updatedChatList = await getChatListByUserId(senderId);

		return res.status(200).json({ updatedChatList: updatedChatList });
	} catch (error) {
		if (
			error.message ===
			'User does not exist. Make sure that the username is correct.'
		) {
			return res.status(404).json({ error: error.message });
		}
		console.error('Error adding chat:', error);
		return res
			.status(500)
			.json({ error: 'Error adding chat. Please try again.' });
	}
};

const getChatRoomData = async (req) => {
	try {
		const username = req.body.recipientName;
		const user = await User.getIdByUsername(username);
		// If there are no rows, the user does not exist
		if (!user) {
			throw new Error(
				'User does not exist. Make sure that the username is correct.'
			);
		}
		const senderId = req.user.user_id;
		const recipientId = req.body.recipientId;

		return { senderId, recipientId };
	} catch (error) {
		throw error;
	}
};

export { addChat };
