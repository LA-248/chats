import { RequestHandler } from 'express';
import { ApiErrorResponse } from '../dtos/error.dto.ts';
import {
  DeleteMessageParamsDto,
  DeleteMessageResponseDto,
  EditMessageInputDto,
  EditMessageParamsDto,
  EditMessageResponseDto,
} from '../dtos/message.dto.ts';
import {
  DeleteMessageParamsSchema,
  EditMessageBodySchema,
  EditMessageParamsSchema,
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
> = async (req, res): Promise<void> => {
  try {
    const senderId = Number(req.user?.user_id);

    const parsedBody = EditMessageBodySchema.safeParse(req.body);
    if (!parsedBody.success) {
      console.error(
        'Error editing message, invalid request body:',
        parsedBody.error
      );
      res.status(400).json({ error: 'Invalid request body data' });
      return;
    }
    const parsedParams = EditMessageParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      console.error(
        'Error editing message, invalid request parameters:',
        parsedParams.error
      );
      res.status(400).json({ error: 'Invalid request parameter data' });
      return;
    }

    await edit(
      parsedBody.data.newMessage,
      senderId,
      parsedParams.data.messageId
    );
    res.status(200).json({ newMessage: parsedBody.data.newMessage });
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ error: 'Error editing message. Please try again.' });
  }
};

export const deleteMessage: RequestHandler<
  DeleteMessageParamsDto,
  DeleteMessageResponseDto | ApiErrorResponse,
  void
> = async (req, res): Promise<void> => {
  try {
    const senderId = Number(req.user?.user_id);

    const parsedParams = DeleteMessageParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      console.error(
        'Error deleting message, invalid request parameters:',
        parsedParams.error
      );
      res.status(400).json({ error: 'Invalid request parameter data' });
      return;
    }

    await deleteChatMessage(
      senderId,
      parsedParams.data.messageId,
      parsedParams.data.type,
      parsedParams.data.chatId
    );
    res.status(200).json({ ok: true, success: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res
      .status(500)
      .json({ error: 'Error deleting message. Please try again.' });
  }
};

export const uploadMedia: RequestHandler = async (req, res): Promise<void> => {
  try {
    const file = req.file as Express.MulterS3.File;
    const { fileKey, fileName } = await upload(file);

    res.status(200).json({ fileKey, fileName });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ error: 'Error uploading media. Please try again.' });
  }
};
