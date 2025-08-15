import { NextFunction, Request, Response } from 'express';
import { Message } from '../models/message.model.ts';
import { MessageType } from '../types/message.ts';

export const enforceMessageEditRules = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const messageId = req.body.messageId;

  try {
    const messageType = await Message.getMessageType(messageId);

    if (messageType === MessageType.IMAGE) {
      res.status(409).json({
        error: 'Action not supported',
        message: 'Editing images is not supported',
      });
      return;
    } else {
      next();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred',
      redirectPath: '/',
    });
  }
};
