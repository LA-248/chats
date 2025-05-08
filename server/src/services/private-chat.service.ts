import { Chat } from '../models/chat-list.model.ts';
import { PrivateChat } from '../models/private-chat.model.ts';
import { v4 as uuidv4 } from 'uuid';
import { generatePresignedUrlsForChatList } from './s3.service.ts';
import {
  ChatDeletionStatus,
  Chat as ChatItem,
} from '../schemas/private-chat.schema.ts';

export const handleChatAddition = async (
  senderId: number,
  recipientId: number
): Promise<ChatItem[]> => {
  const room = await PrivateChat.retrieveRoomByMembers(senderId, recipientId);

  // This check is needed to know whether to insert a new chat in the database and mark it as not deleted, or to only do the latter
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
  return await getChatListByUser(senderId);
};

export const updateLastMessage = async (
  newLastMessageId: number,
  room: string
): Promise<void | null> => {
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

// TODO: Move this function to a more general location - this handles retrieving all chats to construct a user's chat list
export const getChatListByUser = async (
  userId: number
): Promise<ChatItem[]> => {
  try {
    const chatList = await Chat.retrieveAllChats(userId);
    await generatePresignedUrlsForChatList(chatList);
    return chatList;
  } catch (error) {
    throw error;
  }
};
