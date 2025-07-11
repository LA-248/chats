import { Socket, Server } from 'socket.io';
import { User } from '../models/user.model.ts';
import { Group } from '../models/group.model.ts';
import { GroupMember } from '../models/group-member.model.ts';
import { PrivateChat } from '../models/private-chat.model.ts';
import { Message } from '../models/message.model.ts';
import {
  Message as MessageType,
  NewMessage,
} from '../schemas/message.schema.ts';
import { ChatHandler, ChatType } from '../types/chat.ts';
import { addNewPrivateChat } from '../services/private-chat.service.ts';

const handleChatMessages = (socket: Socket, io: Server): void => {
  socket.on('chat-message', async (data, clientOffset, callback) => {
    // In the context of private chats, chatId equals the ID of the recipient
    const { username, chatId, message, room, chatType } = data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const senderId = (socket.handshake as any).session.passport.user;

    try {
      if (chatType === ChatType.PRIVATE) {
        await isBlocked(chatId, senderId); // Check if sender is blocked
        await addNewPrivateChat(io, socket, chatId, room);
      }

      const { newMessage, updatedAt } = await saveMessageInDatabase(
        message,
        senderId,
        chatId,
        room,
        chatType,
        clientOffset
      );

      restoreChat(chatId, room, chatType);
      broadcastMessage(
        io,
        room,
        username,
        message,
        senderId,
        newMessage,
        chatType
      );
      broadcastChatListUpdate(io, room, message, newMessage, updatedAt);
      return;
    } catch (error: unknown) {
      console.error('Error handling chat message:', error);
      if (error instanceof Error) {
        if (error.message === 'Sender is blocked by the recipient') {
          callback(
            'You cannot send messages to this user because they have you blocked'
          );
        }
      }
      callback('Error sending message');
    }
  });
};

// Load all messages of a chat when opened
const displayChatMessages = async (
  socket: Socket,
  room: string
): Promise<void> => {
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

// Send updated message info for the chat list after the last remaining message in a chat is deleted or edited
const updateMostRecentMessage = (socket: Socket, io: Server): void => {
  socket.on('last-message-updated', async (data) => {
    const { room, chatType } = data;
    try {
      const lastMessageInfo = await Message.retrieveLastMessageInfo(room);
      const updatedAt =
        chatType === ChatType.PRIVATE
          ? await PrivateChat.retrieveUpdatedAtDate(room)
          : await Group.retrieveUpdatedAtDate(room);
      io.to(room).emit('last-message-updated', {
        room: room,
        lastMessageContent: lastMessageInfo ? lastMessageInfo.content : null,
        lastMessageTime: lastMessageInfo ? lastMessageInfo.event_time : null,
        updatedAt: updatedAt,
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
const updateMessageList = (socket: Socket, io: Server): void => {
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

const formatMessage = (message: MessageType) => ({
  from: message.sender_username,
  content: message.content,
  eventTime: message.event_time,
  id: message.message_id,
  senderId: message.sender_id,
  isEdited: message.is_edited,
});

const isBlocked = async (
  recipientId: number,
  senderId: number
): Promise<void> => {
  const recipientBlockList = await User.getBlockListById(recipientId);
  if (recipientBlockList) {
    if (recipientBlockList.includes(senderId)) {
      throw new Error('Sender is blocked by the recipient');
    }
  }
};

// Handlers for chat type specific operations, allows for polymorphic behaviour at runtime
const CHAT_HANDLERS: Record<ChatType, ChatHandler> = {
  [ChatType.PRIVATE]: {
    // Get private chat members, this is then used for an authorisation check in the authoriseChatMessage function
    getMembers: async (room: string): Promise<number[]> => {
      try {
        const members = await PrivateChat.retrieveMembersByRoom(room);
        return members ? Object.values(members) : [];
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(
            `Unable to retrieve private chat members: ${error.message}`
          );
        }
        throw new Error('An unexpected error occurred');
      }
    },
    postInsert: async (
      _senderId: number,
      newMessageId: number,
      chatId: number,
      room: string
    ): Promise<Date> => {
      try {
        await PrivateChat.updateUserReadStatus(chatId, false, room);
        // After setting the last message, fetch the new updated_at date which is equal to the time at which the message was sent
        const updatedAt = await PrivateChat.setLastMessage(newMessageId, room);
        return updatedAt;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(
            `Unable to update private chat metadata: ${error.message}`
          );
        }
        throw new Error('An unexpected error occurred');
      }
    },
  },
  [ChatType.GROUP]: {
    // Get all members of a group chat, this is then used for an authorisation check in the authoriseChatMessage function
    getMembers: async (room: string): Promise<number[]> => {
      try {
        const members = await GroupMember.retrieveMembersByRoom(room);
        return members ? members.map((member) => member.user_id) : [];
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(
            `Unable to retrieve group chat members: ${error.message}`
          );
        }
        throw new Error('An unexpected error occurred');
      }
    },
    postInsert: async (
      senderId: number,
      newMessageId: number,
      _chatId: number,
      room: string
    ): Promise<Date> => {
      try {
        await Group.resetReadByList([senderId], room);
        // After setting the last message, fetch the new updated_at date which is equal to the time at which the message was sent
        const updatedAt = await Group.setLastMessage(newMessageId, room);
        return updatedAt;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(
            `Unable to update group chat metadata: ${error.message}`
          );
        }
        throw new Error('An unexpected error occurred');
      }
    },
  },
};

const saveMessageInDatabase = async (
  message: string,
  senderId: number,
  chatId: number,
  room: string,
  chatType: keyof typeof CHAT_HANDLERS,
  clientOffset: string
): Promise<{ newMessage: NewMessage; updatedAt: Date }> => {
  let newMessage: NewMessage | undefined;

  try {
    const chatHandler = CHAT_HANDLERS[chatType];

    await authoriseChatMessage(chatHandler, room, senderId);

    newMessage = await Message.insertNewMessage(
      message,
      senderId,
      // Terrible hack to get past the foreign key constraint in the messages table
      // This error happens because the recipient id in the messages table references the users table,
      // when sending messages in a group chat, the group id is used as the recipient id which does not exist in the user's table
      // TODO: Create distinct tables for private and group chat messages
      chatType === ChatType.PRIVATE ? chatId : null,
      room,
      clientOffset
    );

    // Retrieve the updated_at value of the newly inserted message - it is needed to correctly sort a user's chat list
    // The updated_at value differs from last_message_time in that it will always be populated with the date of the latest chat activity (e.g. message, chat creation, etc),
    // whereas the last_message_time can be null if no messages exist in a chat
    const updatedAt = await chatHandler.postInsert(
      senderId,
      newMessage.id,
      chatId,
      room
    );

    return { newMessage, updatedAt };
  } catch (error) {
    if (newMessage) {
      await Message.deleteMessageById(senderId, newMessage.id);
    }
    if (error instanceof Error) {
      if (
        error.message !== 'User is not authorised to send messages in this chat'
      ) {
        console.error(
          'Message with this client offset already exists:',
          clientOffset
        );
      }
      throw error;
    }
    throw new Error('Unknown error occurred');
  }
};

// Mark a chat as not deleted in the database on incoming message if it was previously marked as deleted
const restoreChat = async (
  recipientId: number,
  room: string,
  chatType: string
): Promise<void> => {
  try {
    if (chatType === ChatType.PRIVATE) {
      const isDeleted = await PrivateChat.retrieveChatDeletionStatus(
        recipientId,
        room
      );
      if (isDeleted) {
        await PrivateChat.updateChatDeletionStatus(recipientId, false, room);
      }
    } else if (chatType === ChatType.GROUP) {
      const membersWhoDeletedChat = await Group.retrieveDeletedForList(room);
      if (membersWhoDeletedChat !== null) {
        await Group.restoreChat(room);
      }
    }
  } catch (error) {
    // Here the error is swallowed, this is because we don't want to block the sender's message from being delivered if restoring -
    // the chat for the recipient fails
    console.error('Error restoring chat:', error);
  }
};

// Emit a chat message to everyone in the relevant room (used for both private and group chats)
const broadcastMessage = (
  io: Server,
  room: string,
  username: string,
  message: string,
  senderId: number,
  newMessage: NewMessage,
  chatType: string
): void => {
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
const broadcastChatListUpdate = (
  io: Server,
  room: string,
  message: string,
  newMessage: NewMessage,
  updatedAt: Date
): void => {
  io.to(room).emit('update-chat-list', {
    room: room,
    lastMessageContent: message,
    lastMessageTime: newMessage.event_time,
    updatedAt: updatedAt,
  });
};

// Prevent users from sending messages to chat rooms they are not a part of
// This check is needed because messages do not go through the existing auth middleware since they are handled via sockets and not HTTP routes
const authoriseChatMessage = async (
  chatHandler: ChatHandler,
  room: string,
  senderId: number
): Promise<void> => {
  const memberIds = await chatHandler.getMembers(room);
  if (!memberIds.includes(senderId)) {
    throw new Error('User is not authorised to send messages in this chat');
  }
};

export {
  handleChatMessages,
  displayChatMessages,
  updateMostRecentMessage,
  updateMessageList,
};
