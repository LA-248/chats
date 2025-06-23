import { Server, Socket } from 'socket.io';
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
import { userSockets } from '../handlers/socket-handlers.ts';

export const handleChatAddition = async (
  socket: Socket,
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
    socket.join(newRoom);
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

// When a user receives a message from someone for the first time, add the chat to their chat list in real-time
export const addNewPrivateChat = async (
  io: Server,
  socket: Socket,
  recipientId: number,
  room: string
): Promise<void> => {
  try {
    const lastMessageId = await PrivateChat.retrieveLastMessageId(room);
    const socketId = userSockets.get(recipientId);

    // If lastMessageId is null it means it's the first message being sent in the chat, which should -
    // trigger the chat to be added to the recipient's chat list
    if (socketId && lastMessageId === null) {
      const newChat = await getChat(recipientId, room);
      const recipientSocket = io.sockets.sockets.get(socketId);
      recipientSocket?.join(room);
      socket.to(socketId).emit('add-private-chat-to-chat-list', newChat);
    }
  } catch (error) {
    // Here the error is swallowed, this is because we don't want to block the sender's message from being delivered if adding -
    // the new chat for the recipient fails
    console.error('Error adding new private chat:', error);
  }
};

// TODO: Move this function to a more general location - this handles retrieving all chats to construct a user's chat list
export const getChatListByUser = async (
  userId: number
): Promise<ChatItem[]> => {
  const chatList = await Chat.retrieveAllChatsByUser(userId);
  await generatePresignedUrlsForChatList(chatList);
  return chatList;
};
