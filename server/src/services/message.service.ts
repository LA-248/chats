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

export const deleteChatMessage = async (
  senderId: number,
  messageId: number
): Promise<void> => {
  const messageType = await Message.retrieveMessageType(messageId);
  const isImage = messageType === MessageType.IMAGE;

  // If the message being deleted is an image, delete the image in the S3 bucket
  if (isImage) {
    // Retrieve the file key (saved as message content) from the database
    const objectKey = await Message.retrieveMessageContent(senderId, messageId);

    await deleteS3Object(process.env.BUCKET_NAME!, objectKey);
  }

  return await Message.deleteMessageById(senderId, messageId);
};

export const upload = async (file: Express.MulterS3.File) => {
  return { fileKey: file.key, fileName: file.originalname };
};
