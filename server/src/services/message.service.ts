import { Message } from '../models/message.model.ts';
import { DeletedMessage } from '../schemas/message.schema.ts';

export const edit = async (
  newMessage: string,
  messageId: number
): Promise<void> => {
  return await Message.editMessageContent(newMessage, messageId);
};

export const handleMessageDeletion = async (
  messageId: number
): Promise<DeletedMessage> => {
  return await Message.deleteMessageById(messageId);
};
