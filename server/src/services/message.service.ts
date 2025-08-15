import { Message } from '../models/message.model.ts';
import { MessageType } from '../types/message.ts';
import { deleteS3Object } from './s3.service.ts';

export const edit = async (
  newMessage: string,
  senderId: number,
  messageId: number
): Promise<void> => {
  return await Message.editMessageContent(newMessage, senderId, messageId);
};

export const remove = async (
  senderId: number,
  messageId: number
): Promise<void> => {
  const messageType = await Message.getMessageType(messageId);
  const isImage = messageType === MessageType.IMAGE;

  // If the message being deleted is an image, delete the image in the S3 bucket
  if (isImage) {
    // Retrieve the file key (saved as message content) from the database
    const fileKey = await Message.getMessageContent(senderId, messageId);

    await deleteS3Object(process.env.BUCKET_NAME!, fileKey);
  }

  return await Message.deleteMessageById(senderId, messageId);
};

export const upload = async (file: Express.MulterS3.File) => {
  const fileKey = file.key;
  return fileKey;
};
