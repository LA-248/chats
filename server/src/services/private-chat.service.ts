import { Chat } from '../models/chat-list.model.ts';
import { PrivateChat } from '../models/private-chat.model.ts';
import { v4 as uuidv4 } from 'uuid';
import {
  createPresignedUrl,
  generatePresignedUrlsForChatList,
} from './s3.service.ts';
import {
  ChatDeletionStatus,
  Chat as ChatItem,
} from '../schemas/private-chat.schema.ts';

export const handleChatAddition = async (
  senderId: number,
  recipientId: number
): Promise<ChatItem> => {
  const room = await PrivateChat.retrieveRoomByMembers(senderId, recipientId);

  // This check is needed to know whether to insert a new chat in the database and mark it as not deleted, or to only do the latter
  // All chats are marked as deleted by default to prevent incorrectly displaying them in a user's chat list
  if (room === null) {
    const newRoom = uuidv4();
    await PrivateChat.insertNewChat(senderId, recipientId, newRoom);
    await PrivateChat.updateChatDeletionStatus(senderId, false, newRoom);
    return await getChat(senderId, newRoom); // Retrieve newly inserted/created chat for addition
  } else {
    await PrivateChat.updateChatDeletionStatus(senderId, false, room);
    return await getChat(senderId, room); // Retrieve pre-existing chat for addition after it's flagged as not deleted
  }
};

// Update the last message for a chat, used when most recent message is deleted
export const updateLastMessage = async (
  newLastMessageId: number,
  room: string
): Promise<void> => {
  return await PrivateChat.updateLastMessage(newLastMessageId, room);
};

export const updateReadStatus = async (
  userId: number,
  read: boolean,
  room: string
): Promise<void> => {
  return await PrivateChat.updateUserReadStatus(userId, read, room);
};

export const updateDeletionStatus = async (
  userId: number,
  room: string
): Promise<ChatDeletionStatus> => {
  return await PrivateChat.updateChatDeletionStatus(userId, true, room);
};

export const getChat = async (
  senderId: number,
  room: string
): Promise<ChatItem> => {
  const addedChat = await PrivateChat.retrieveChat(senderId, room);
  const profilePictureName = addedChat.chat_picture;
  const profilePictureUrl = profilePictureName
    ? await createPresignedUrl(process.env.BUCKET_NAME!, profilePictureName)
    : null;
  addedChat.chat_picture = profilePictureUrl;

  return addedChat;
};

// TODO: Move this function to a more general location - this handles retrieving all chats to construct a user's chat list
export const getChatListByUser = async (
  userId: number
): Promise<ChatItem[]> => {
  try {
    const chatList = await Chat.retrieveAllChatsByUser(userId);
    await generatePresignedUrlsForChatList(chatList);
    return chatList;
  } catch (error) {
    throw error;
  }
};
