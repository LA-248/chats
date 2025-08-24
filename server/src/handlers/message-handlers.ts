import { Socket, Server } from 'socket.io';
import { Group } from '../models/group.model.ts';
import { GroupMember } from '../models/group-member.model.ts';
import { PrivateChat } from '../models/private-chat.model.ts';
import { Message } from '../models/message.model.ts';
import {
  FormattedMessage,
  Message as MessageStructure,
  NewMessage,
} from '../schemas/message.schema.ts';
import { ChatHandler, ChatType } from '../types/chat.ts';
import { addNewPrivateChat } from '../services/private-chat.service.ts';
import { createPresignedUrl } from '../services/s3.service.ts';
import { MessageType } from '../types/message.ts';
import {
  authoriseChatMessage,
  isSenderBlocked,
} from '../middlewares/message.middleware.ts';

const handleChatMessages = (socket: Socket, io: Server): void => {
  socket.on('chat-message', async (data, clientOffset, callback) => {
    // In the context of private chats, chatId equals the ID of the recipient
    const { username, chatId, content, room, chatType, messageType } = data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const senderId = (socket.handshake as any).session.passport.user;
    const isImage = messageType === MessageType.IMAGE;

    try {
      if (chatType === ChatType.PRIVATE) {
        await isSenderBlocked(chatId, senderId);
        await addNewPrivateChat(io, socket, chatId, room);
      }

      const { newMessage, updatedAt } = await saveMessageInDatabase(
        content,
        senderId,
        chatId,
        room,
        chatType,
        messageType,
        clientOffset
      );

      restoreChat(chatId, room, chatType);
      broadcastMessage(
        io,
        room,
        username,
        isImage
          ? await createPresignedUrl(process.env.BUCKET_NAME!, content)
          : content,
        senderId,
        newMessage,
        chatType,
        messageType
      );
      broadcastChatListUpdate(io, room, content, newMessage, updatedAt);

      if (isImage) {
        callback('Image uploaded');
      }

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

      const settled = await Promise.allSettled(messages.map(formatMessage));
      const initialMessages = settled
        .filter((result) => result.status === 'fulfilled')
        .map((result) => {
          return result.value;
        });
      socket.emit('initial-messages', initialMessages);
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
      const isImage = lastMessageInfo?.type === MessageType.IMAGE;
      const isPrivateChat = chatType === ChatType.PRIVATE;

      const lastMessageContent = lastMessageInfo
        ? isImage
          ? 'Image'
          : lastMessageInfo.content
        : null;

      const lastMessageTime = lastMessageInfo
        ? lastMessageInfo.event_time
        : null;

      const updatedAt = isPrivateChat
        ? await PrivateChat.retrieveUpdatedAtDate(room)
        : await Group.retrieveUpdatedAtDate(room);

      io.to(room).emit('last-message-updated', {
        room: room,
        lastMessageContent,
        lastMessageTime,
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
        updatedMessageList: await Promise.all(messages.map(formatMessage)),
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

const formatMessage = async (
  message: MessageStructure
): Promise<FormattedMessage> => {
  const isImage = message.type === MessageType.IMAGE;
  const content = isImage
    ? await createPresignedUrl(process.env.BUCKET_NAME!, message.content)
    : message.content;

  return {
    from: message.sender_username,
    content,
    eventTime: message.event_time,
    id: message.message_id,
    senderId: message.sender_id,
    isEdited: message.is_edited,
    type: message.type,
  };
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
  messageType: string,
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
      messageType,
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
    // TODO: Use database transactions instead of manually deleting inserted messages when an error occurs
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
    const isPrivateChat = chatType === ChatType.PRIVATE;
    const isGroupChat = chatType === ChatType.GROUP;

    if (isPrivateChat) {
      const isDeleted = await PrivateChat.retrieveChatDeletionStatus(
        recipientId,
        room
      );
      if (isDeleted) {
        await PrivateChat.updateChatDeletionStatus(recipientId, false, room);
      }
    } else if (isGroupChat) {
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
  content: string,
  senderId: number,
  newMessage: NewMessage,
  chatType: ChatType,
  type: MessageType
): void => {
  io.to(room).emit('chat-message', {
    from: username,
    content: content,
    room: room,
    eventTime: newMessage.event_time,
    id: newMessage.id,
    senderId: senderId,
    chatType: chatType,
    type: type,
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
  const isImage = newMessage.type === MessageType.IMAGE;

  io.to(room).emit('update-chat-list', {
    room: room,
    lastMessageContent: isImage ? 'Image' : message,
    lastMessageTime: newMessage.event_time,
    updatedAt: updatedAt,
  });
};

export {
  handleChatMessages,
  displayChatMessages,
  updateMostRecentMessage,
  updateMessageList,
};
