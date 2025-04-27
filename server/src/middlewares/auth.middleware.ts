import { NextFunction, Request, Response } from 'express';
import { GroupMember } from '../models/group-member.model.ts';
import { PrivateChat } from '../models/private-chat.model.ts';
import { GroupParticipant } from '../types/group.js';

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.status(401).json({
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
) => {
  const senderId = req.user?.user_id;
  const room = req.params.room;

  try {
    const privateChatMembers = await PrivateChat.retrieveMembersByRoom(room);

    if (!privateChatMembers) {
      return res.status(404).json({
        error: 'Not found',
        message: 'This chat does not exist',
        redirectPath: '/',
      });
    }

    if (Object.values(privateChatMembers).includes(senderId)) {
      return next();
    } else {
      return res.status(403).json({
        error: 'Unauthorised',
        message: 'You are not a member of this chat',
        redirectPath: '/',
      });
    }
  } catch (error) {
    return res.status(500).json({
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
) => {
  const senderId = req.user?.user_id;
  const room = req.params.room;

  try {
    const groupChatMembers = await GroupMember.retrieveMembersByRoom(room);
    if (!groupChatMembers) {
      return res.status(404).json({
        error: 'Not found',
        message: 'This chat does not exist',
        redirectPath: '/',
      });
    }
    const groupChatMemberIds = groupChatMembers.map(
      (member: GroupParticipant) => member.user_id
    );

    if (!senderId) {
      return res.status(401).json({ error: 'Invalid ID' });
    }
    if (groupChatMemberIds.includes(Number(senderId))) {
      return next();
    }

    return res.status(403).json({
      error: 'Unauthorised',
      message: 'You are not a member of this chat',
      redirectPath: '/',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred',
      redirectPath: '/',
    });
  }
};

export { requireAuth, privateChatRoomAuth, groupChatRoomAuth };
