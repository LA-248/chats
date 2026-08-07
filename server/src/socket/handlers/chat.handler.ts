import { Server, Socket } from 'socket.io';
import {
  isSenderBlocked,
} from '../../middlewares/message.middleware.ts';
import { GroupMember as GroupMemberRepository } from '../../repositories/group-member.repository.ts';
import { Group } from '../../repositories/group.repository.ts';
import { Message as MessageRepository } from '../../repositories/message.repository.ts';
import { PrivateChat } from '../../repositories/private-chat.repository.ts';
import {
  FormattedMessage,
  Message as MessageStructure,
  NewMessage,
} from '../../schemas/message.schema.ts';
import { addNewPrivateChat } from '../../services/private-chat.service.ts';
import { createPresignedUrl } from '../../services/s3.service.ts';
import {
  ChatHandler,
  ChatType,
  S3AttachmentsStoragePath,
} from '../../types/chat.ts';
import { Message, ClientMessageEventPayload, MessageType } from '../../types/message.ts';
import { MessageUpdateEventType } from '../../types/message.ts';

export const createChatMessageHandler = (socket: Socket, io: Server) =>
  async (data: ClientMessageEventPayload, clientOffset: string, callback: any) => {
    // In the context of private chats, chatId equals the ID of the recipient
    // fileKey is used for media uploads.
    const {
      username,
      chatId,
      content,
      room,
      chatType,
      messageType,
      fileKey,
    } = data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const senderId = (socket as any).request.session.passport.user;
    const isImage = messageType === MessageType.IMAGE;

    try {
      if (chatType === ChatType.PRIVATE) {
        await Promise.all([
          isSenderBlocked(chatId, senderId),
          addNewPrivateChat(io, socket, chatId, room),
        ]);
      }

      const [{ newMessage, updatedAt }] = await Promise.all([
        saveMessageInDatabase(
          content,
          senderId,
          chatId,
          room,
          chatType,
          messageType,
          clientOffset,
        ),
        restoreChat(chatId, room, chatType),
      ]);
      const messageContent = isImage ? await createPresignedUrl(process.env.BUCKET_NAME!, fileKey as string) : content;

      broadcastMessage(
        io,
        room,
        username,
        messageContent,
        senderId,
        newMessage,
        chatType,
        messageType,
      );
      broadcastChatListUpdate(io, room, content, newMessage, updatedAt);

      if (isImage) {
        callback({ success: true, message: 'Media uploaded' });
      }

      return;
    } catch (error: unknown) {
      console.error('Error handling chat message:', error);
      if (error instanceof Error) {
        if (error.message === 'Sender is blocked by the recipient') {
          callback({
            success: false,
            error: 'You cannot send messages to this user because they have you blocked',
          });
        }
      }
      callback({
        success: false,
        error: 'Error sending message',
      });
    }
  }

// Load all messages of a chat when opened
export const displayChatMessagesHandler = async (
  socket: Socket,
  room: string,
): Promise<void> => {
  if (!socket.recovered) {
    try {
      const messageRepository = new MessageRepository();

      // Get messages from database for display, filtered by room
      const messages = await messageRepository.findMessageList(
        socket.handshake.auth.serverOffset,
        room,
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
export const updateRecentMessageHandler = (socket: Socket, io: Server) =>
  async (data: { room: string, chatType: ChatType }) => {
    const { room, chatType } = data;

    try {
      const messageRepository = new MessageRepository();
      const privateChatRepository = new PrivateChat();
      const groupRepository = new Group();

      const lastMessageInfo = await messageRepository.findLastMessageInfo(room);
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

      const { updated_at } = isPrivateChat
        ? await privateChatRepository.findUpdatedAtDate(room)
        : await groupRepository.findUpdatedAtDate(room);
      const updatedAt = updated_at;

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
  };

// TODO: Don't retrieve the whole message list after a message is deleted or edited - optimise it
// Listen for message deletes and edits, and emit the updated message list to the relevant room
export const updateMessageListHandler = (socket: Socket, io: Server) =>
  async (room: string, updateType: MessageUpdateEventType) => {
    try {
      const messageRepository = new MessageRepository();

      const messages = await messageRepository.findMessageList(
        socket.handshake.auth.serverOffset,
        room,
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
  };

const formatMessage = async (
  message: MessageStructure,
): Promise<FormattedMessage> => {
  const recipientId = message.recipient_id;
  const groupId = message.group_id;

  const isGroup = recipientId === null ? true : false;
  const chatId = isGroup ? groupId : recipientId;
  const chatType = isGroup ? 'group' : 'private';
  const isImage = message.type === MessageType.IMAGE;

  const content = isImage
    ? await createPresignedUrl(
      process.env.BUCKET_NAME!,
      `${S3AttachmentsStoragePath.CHAT_ATTACHMENTS}/${chatType}/${chatId}/${message.content}`,
    )
    : message.content;

  return {
    from: message.sender_username,
    content,
    eventTime: message.event_time,
    id: message.message_id,
    senderId: message.sender_id,
    isEdited: message.is_edited,
    messageType: message.type,
  };
};

// Handlers for chat type specific operations, allows for polymorphic behaviour at runtime
const CHAT_HANDLERS: Record<ChatType, ChatHandler> = {
  [ChatType.PRIVATE]: {
    // Get private chat members, this is then used for an authorisation check in the authoriseChatMessage function
    postInsert: async (
      senderId: number,
      newMessageId: number,
      _chatId: number,
      room: string,
    ): Promise<Date> => {
      try {
        const privateChatRepository = new PrivateChat();

        const [{ updated_at: updatedAt }] = await Promise.all([
          // After setting the last message, fetch the new updated_at date, which is equal to the time at which the message was sent
          privateChatRepository.setLastMessage(newMessageId, room),
          privateChatRepository.updateLastReadAt(senderId, room),
        ]);

        return updatedAt;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(
            `Unable to update private chat metadata: ${error.message}`,
          );
        }
        throw new Error('An unexpected error occurred');
      }
    },
  },
  [ChatType.GROUP]: {
    // Get all members of a group chat, this is then used for an authorisation check in the authoriseChatMessage function
    postInsert: async (
      senderId: number,
      newMessageId: number,
      chatId: number,
      room: string,
    ): Promise<Date> => {
      try {
        const groupRepository = new Group();
        const groupMemberRepository = new GroupMemberRepository();

        const [{ updated_at: updatedAt }] = await Promise.all([
          // After setting the last message, fetch the new updated_at date which is equal to the time at which the message was sent
          groupRepository.setLastMessage(newMessageId, room),
          groupMemberRepository.updateLastReadAt(chatId, senderId),
        ]);

        return updatedAt;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(
            `Unable to update group chat metadata: ${error.message}`,
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
  clientOffset: string,
): Promise<{ newMessage: NewMessage; updatedAt: Date }> => {
  let newMessage: NewMessage | undefined;

  try {
    const messageRepository = new MessageRepository();
    const chatHandler = CHAT_HANDLERS[chatType];
    const isPrivateChat = chatType === ChatType.PRIVATE;
    const isGroupChat = chatType === ChatType.GROUP;

    newMessage = await messageRepository.insertNewMessage(
      message,
      senderId,
      // Terrible hack to get past the foreign key constraint in the messages table
      // This error happens because the recipient id in the messages table references the users table.
      // When sending messages in a group chat, the group id is used as the recipient id which does not exist in the user's table
      // TODO: Create distinct tables for private and group chat messages
      isPrivateChat ? chatId : null,
      isGroupChat ? chatId : null,
      room,
      messageType,
      clientOffset,
    );

    // Retrieve the updated_at value of the newly inserted message - it's needed to correctly sort a user's chat list
    // The updated_at value differs from last_message_time in that it will always be populated with the date of the latest chat activity (e.g. message, chat creation, etc), whereas the last_message_time can be null if no messages exist in a chat
    const updatedAt = await chatHandler.postInsert(
      senderId,
      newMessage.message_id,
      chatId,
      room,
    );

    return { newMessage, updatedAt };
  } catch (error) {
    // TODO: Use database transactions instead of manually deleting inserted messages when an error occurs
    if (newMessage) {
      const messageRepository = new MessageRepository();
      await messageRepository.deleteMessage(senderId, newMessage.message_id);
    }
    if (error instanceof Error) {
      if (
        error.message !== 'User is not authorised to send messages in this chat'
      ) {
        console.error(
          'Message with this client offset already exists:',
          clientOffset,
        );
      }
      throw error;
    }
    throw new Error('Unknown error occurred');
  }
};

// Mark a chat as not deleted in the database on incoming message if it was previously marked as deleted
const restoreChat = async (
  recipientId: number, // For group chats, this is the groupId
  room: string,
  chatType: string,
): Promise<void> => {
  try {
    const privateChatRepository = new PrivateChat();
    const groupMemberRepository = new GroupMemberRepository();

    const isPrivateChat = chatType === ChatType.PRIVATE;
    const isGroupChat = chatType === ChatType.GROUP;

    if (isPrivateChat) {
      const isDeleted = await privateChatRepository.findChatDeletionStatus(
        recipientId,
        room,
      );
      if (isDeleted) {
        await privateChatRepository.restoreChat(recipientId, room);
      }
    } else if (isGroupChat) {
      const groupId = recipientId;
      await groupMemberRepository.restore(groupId);
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
  messageType: MessageType,
): void => {
  const payload: Message = {
    from: username,
    content,
    room,
    eventTime: newMessage.event_time,
    id: newMessage.message_id,
    senderId,
    chatType,
    messageType,
  }

  io.to(room).emit('chat-message', payload);
};

// Update the chat's preview info in the chat list for everyone in the room
const broadcastChatListUpdate = (
  io: Server,
  room: string,
  message: string,
  newMessage: NewMessage,
  updatedAt: Date,
): void => {
  const isImage = newMessage.type === MessageType.IMAGE;

  io.to(room).emit('update-chat-list', {
    room: room,
    lastMessageContent: isImage ? 'Image' : message,
    lastMessageTime: newMessage.event_time,
    updatedAt: updatedAt,
  });
};
