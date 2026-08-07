import { GroupMember } from '../repositories/group-member.repository.ts';
import { Group } from '../repositories/group.repository.ts';
import { Message as MessageRepository } from '../repositories/message.repository.ts';
import { PrivateChat } from '../repositories/private-chat.repository.ts';
import { FormattedMessage, Message, NewMessage } from '../schemas/message.schema.ts';
import { ChatHandler, ChatType, S3AttachmentsStoragePath } from '../types/chat.ts';
import { MessageType } from '../types/message.ts';
import { createPresignedUrl, deleteS3Object } from './s3.service.ts';

export const edit = async (
  newMessage: string,
  senderId: number,
  messageId: number,
): Promise<void> => {
  const messageRepository = new MessageRepository();
  return await messageRepository.updateMessageContent(
    newMessage,
    senderId,
    messageId,
  );
};

export const deleteChatMessage = async (
  senderId: number,
  messageId: number,
  chatType: string,
  chatId: string,
): Promise<void> => {
  const messageRepository = new MessageRepository();
  const messageType = await messageRepository.findMessageType(messageId);
  const isImage = messageType === MessageType.IMAGE;

  // If the message being deleted is an image, delete the image in S3
  if (isImage) {
    const messageRepository = new MessageRepository();
    const fileName = await messageRepository.findMessageContent(
      senderId,
      messageId,
    );
    const objectKey = `${S3AttachmentsStoragePath.CHAT_ATTACHMENTS}/${chatType}/${chatId}/${fileName}`;
    await deleteS3Object(process.env.BUCKET_NAME!, objectKey);
  }

  return await messageRepository.deleteMessage(senderId, messageId);
};

export const upload = async (file: Express.MulterS3.File) => {
  return { fileKey: file.key, fileName: file.originalname };
};

export const formatMessage = async (
  message: Message,
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
        const groupMemberRepository = new GroupMember();

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

export const saveMessageInDatabase = async (
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
export const restoreChat = async (
  recipientId: number, // For group chats, this is the groupId
  room: string,
  chatType: string,
): Promise<void> => {
  try {
    const privateChatRepository = new PrivateChat();
    const groupMemberRepository = new GroupMember();

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
