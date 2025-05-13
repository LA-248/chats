import { Message } from '../models/message.model.ts';

export const edit = async (
  newMessage: string,
  senderId: number,
  messageId: number
): Promise<void> => {
  return await Message.editMessageContent(newMessage, senderId, messageId);
};

export const handleMessageDeletion = async (
  senderId: number,
  messageId: number
): Promise<void> => {
  return await Message.deleteMessageById(senderId, messageId);
};
