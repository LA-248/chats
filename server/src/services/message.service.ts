import { Message } from '../models/message.model.ts';
import { S3AttachmentsStoragePath } from '../types/chat.ts';
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
  messageId: number,
  chatType: string,
  chatId: string
): Promise<void> => {
  const messageType = await Message.retrieveMessageType(messageId);
  const isImage = messageType === MessageType.IMAGE;

  // If the message being deleted is an image, delete the image in S3
  if (isImage) {
    const fileName = await Message.retrieveMessageContent(senderId, messageId);
    const objectKey = `${S3AttachmentsStoragePath.CHAT_ATTACHMENTS}/${chatType}/${chatId}/${fileName}`;
    await deleteS3Object(process.env.BUCKET_NAME!, objectKey);
  }

  return await Message.deleteMessageById(senderId, messageId);
};

export const upload = async (file: Express.MulterS3.File) => {
  return { fileKey: file.key, fileName: file.originalname };
};
