import { NextFunction, Request, Response } from 'express';
import { GroupMember } from '../models/group-member.model.ts';
import { PrivateChat } from '../models/private-chat.model.ts';

const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({
      error: 'Unauthorised',
      message: 'You must be logged in to access this resource',
    });
  }
};

// Room-specific authorisation middleware
// Check if a room exists and/or if the user is a member of it
const privateChatRoomAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const senderId = Number(req.user?.user_id);
  const room = req.params.room;

  try {
    const privateChatMembers = await PrivateChat.retrieveMembersByRoom(room);
    if (!privateChatMembers) {
      res.status(404).json({
        error: 'Not found',
        message: 'This chat does not exist',
        redirectPath: '/',
      });
      return;
    }

    if (senderId) {
      if (Object.values(privateChatMembers).includes(senderId)) {
        next();
        return;
      } else {
        res.status(403).json({
          error: 'Unauthorised',
          message: 'You are not a member of this chat',
          redirectPath: '/',
        });
        return;
      }
    }
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred',
      redirectPath: '/',
    });
  }
};

const groupChatRoomAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const senderId = Number(req.user?.user_id);
  const room = req.params.room;

  try {
    const groupChatMembers = await GroupMember.retrieveMembersByRoom(room);
    if (!groupChatMembers) {
      res.status(404).json({
        error: 'Not found',
        message: 'This chat does not exist',
        redirectPath: '/',
      });
      return;
    }
    const groupChatMemberIds = groupChatMembers.map(
      (member: { user_id: number }) => member.user_id
    );

    if (!senderId) {
      res.status(401).json({ error: 'Invalid ID' });
      return;
    }
    if (groupChatMemberIds.includes(senderId)) {
      next();
    }

    res.status(403).json({
      error: 'Unauthorised',
      message: 'You are not a member of this chat',
      redirectPath: '/',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred',
      redirectPath: '/',
    });
  }
};

export { requireAuth, privateChatRoomAuth, groupChatRoomAuth };
