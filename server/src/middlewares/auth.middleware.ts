import { NextFunction, Request, Response } from 'express';
import { GroupMember } from '../models/group-member.model.ts';
import { PrivateChat } from '../models/private-chat.model.ts';
import { Group } from '../models/group.model.ts';
import { GroupInfo, GroupMembers } from '../schemas/group.schema.ts';

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).json({
      error: 'Unauthorised',
      message: 'You must be logged in to access this resource',
    });
  }
};

// Room-specific authorisation middleware
// Check if a room exists and/or if the user is a member of it
export const privateChatRoomAuth = async (
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
        return next();
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

export const groupChatRoomAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const senderId = Number(req.user?.user_id);
  const groupId = Number(req.params.groupId);

  try {
    const room =
      req.params.room ?? (await Group.retrieveRoomByGroupId(groupId));
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
      return next();
    } else {
      res.status(403).json({
        error: 'Unauthorised',
        message: 'You are not a member of this chat',
        redirectPath: '/',
      });
      return;
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

export const groupMemberRemovalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const loggedInUserId = Number(req.user?.user_id);
  const groupId = Number(req.params.groupId);
  const userToBeRemoved = Number(req.params.userId);
  const room = await Group.retrieveRoomByGroupId(groupId);

  try {
    const groupChatMembers: GroupMembers[] | null =
      await GroupMember.retrieveMembersByRoom(room);
    if (!groupChatMembers) {
      res.status(404).json({
        error: 'Not found',
        message: 'This chat does not exist',
        redirectPath: '/',
      });
      return;
    }

    if (!loggedInUserId || !userToBeRemoved) {
      res.status(401).json({ error: 'Invalid ID' });
      return;
    }

    const isOwner = groupChatMembers.some(
      (member) => member.user_id === loggedInUserId && member.role === 'owner'
    );

    if (isOwner) {
      return next();
    } else {
      res.status(403).json({
        error: 'Unauthorised',
        message: 'You may not perform this action',
        redirectPath: '/',
      });
      return;
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
