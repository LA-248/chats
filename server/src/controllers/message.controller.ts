import { RequestHandler } from 'express';
import { ApiErrorResponse } from '../dtos/error.dto.ts';
import { DeleteMessageResponseDto } from '../dtos/message.dto.ts';
import {
  DeleteMessageParamsDto,
  EditMessageInputDto,
  EditMessageParamsDto,
  EditMessageResponseDto,
} from '../schemas/message.schema.ts';
import {
  deleteChatMessage,
  edit,
  upload,
} from '../services/message.service.ts';

export const editMessage: RequestHandler<
  EditMessageParamsDto,
  EditMessageResponseDto | ApiErrorResponse,
  EditMessageInputDto
> = async (req, res) => {
  try {
    const senderId = Number(req.user?.user_id);
    const messageId = Number(req.params.messageId);

    await edit(req.body.newMessage, senderId, messageId);
    res.status(200).json({ newMessage: req.body.newMessage });
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ error: 'Error editing message. Please try again.' });
  }
};

export const deleteMessage: RequestHandler<
  DeleteMessageParamsDto,
  DeleteMessageResponseDto | ApiErrorResponse,
  void
> = async (req, res) => {
  try {
    const senderId = Number(req.user?.user_id);
    const messageId = Number(req.params.messageId);
    const type = req.params.type;
    const chatId = req.params.chatId;

    await deleteChatMessage(senderId, messageId, type, chatId);
    res.status(200).json({ ok: true, success: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res
      .status(500)
      .json({ error: 'Error deleting message. Please try again.' });
  }
};

export const uploadMedia: RequestHandler = async (req, res) => {
  try {
    const file = req.file as Express.MulterS3.File;
    const { fileKey, fileName } = await upload(file);

    res.status(200).json({ fileKey, fileName });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ error: 'Error uploading media. Please try again.' });
  }
};
