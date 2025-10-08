import { NextFunction, Request, Response } from 'express';
import { Message } from '../models/message.model.ts';
import { MessageType } from '../types/message.ts';
import { User } from '../repositories/user.repository.ts';
import { ChatHandler } from '../types/chat.ts';

// Prevent users from sending messages to chat rooms they are not a part of
// This check is needed because messages do not go through the existing auth middleware since they are handled via sockets and not HTTP routes
export const authoriseChatMessage = async (
  chatHandler: ChatHandler,
  room: string,
  senderId: number
): Promise<void> => {
  const memberIds = await chatHandler.getMembers(room);
  if (!memberIds.includes(senderId)) {
    throw new Error('User is not authorised to send messages in this chat');
  }
};

export const enforceMessageEditRules = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const messageId = Number(req.params.messageId);

  try {
    const messageType = await Message.retrieveMessageType(messageId);

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

export const isSenderBlocked = async (
  recipientId: number,
  senderId: number
): Promise<void> => {
  const userRepository = new User();
  const result = await userRepository.findBlockListById(recipientId);
  const recipientBlockList = result.blocked_users;

  if (recipientBlockList) {
    if (recipientBlockList.includes(senderId)) {
      throw new Error('Sender is blocked by the recipient');
    }
  }
};
