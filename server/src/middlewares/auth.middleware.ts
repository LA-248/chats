import { NextFunction, Request, Response } from 'express';
import { GroupMember } from '../models/group-member.model.ts';
import { Group } from '../models/group.model.ts';
import { GroupMemberPartialInfo } from '../schemas/group.schema.ts';
import { GroupMemberRole } from '../types/group.ts';
import { PrivateChat } from '../repositories/private-chat.repository.ts';

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
    const privateChatRepository = new PrivateChat();
    const privateChatMembers = await privateChatRepository.findMembersByRoom(
      room
    );
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
  } catch {
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred',
      redirectPath: '/',
    });
  }
};

// Verify that the user making the request is a member of the group
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

export const authoriseGroupOwnerAction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const loggedInUserId = Number(req.user?.user_id);
  const groupId = Number(req.params.groupId);
  const room = await Group.retrieveRoomByGroupId(groupId);

  try {
    const groupChatMembers: GroupMemberPartialInfo[] | null =
      await GroupMember.retrieveMembersByRoom(room);
    if (!groupChatMembers) {
      res.status(404).json({
        error: 'Not found',
        message: 'This chat does not exist',
        redirectPath: '/',
      });
      return;
    }

    if (!loggedInUserId) {
      res.status(401).json({ error: 'Invalid ID' });
      return;
    }

    const isOwner = groupChatMembers.some(
      (member) =>
        member.user_id === loggedInUserId &&
        member.role === GroupMemberRole.OWNER
    );

    if (isOwner) {
      return next();
    } else {
      res.status(403).json({
        error: 'Unauthorised',
        message: 'You are unauthorised to perform this action',
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

// Ensure that only group owners or admins can perform the requested action
export const authoriseGroupOwnerOrAdminAction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const loggedInUserId = Number(req.user?.user_id);
  const groupId = Number(req.params.groupId);
  const room = await Group.retrieveRoomByGroupId(groupId);

  try {
    const groupChatMembers: GroupMemberPartialInfo[] | null =
      await GroupMember.retrieveMembersByRoom(room);
    if (!groupChatMembers) {
      res.status(404).json({
        error: 'Not found',
        message: 'This chat does not exist',
        redirectPath: '/',
      });
      return;
    }

    if (!loggedInUserId) {
      res.status(401).json({ error: 'Invalid ID' });
      return;
    }

    const isOwner = groupChatMembers.some(
      (member) =>
        member.user_id === loggedInUserId &&
        member.role === GroupMemberRole.OWNER
    );
    const isAdmin = groupChatMembers.some(
      (member) =>
        member.user_id === loggedInUserId &&
        member.role === GroupMemberRole.ADMIN
    );

    if (isOwner || isAdmin) {
      return next();
    } else {
      res.status(403).json({
        error: 'Unauthorised',
        message: 'You are unauthorised to perform this action',
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
