import { Request, Response } from 'express';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import {
  addUsersToGroup,
  addUserToReadList,
  getMemberUsernames,
  markGroupAsDeleted,
  permanentlyDeleteGroupChat,
  removeMember,
  retrieveGroupInfoWithMembers,
  updateLastGroupMessage,
  uploadGroupPicture,
} from '../services/group.service.ts';
import { createNewGroup } from '../services/group.service.ts';
import {
  GroupMemberInsertionResult,
  GroupMemberToBeAdded,
} from '../types/group.js';
import { userSockets } from '../handlers/socket-handlers.ts';

// Handle creating a group chat
export const createGroupChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const io: Server = req.app.get('io');
    const ownerUserId: number = req.body.loggedInUserId;
    const groupName: string = req.body.groupName;
    const room: string = uuidv4();
    const addedMembers: GroupMemberToBeAdded[] = req.body.addedMembers;
    const failedInsertions: GroupMemberInsertionResult[] = await createNewGroup(
      io,
      ownerUserId,
      groupName,
      room,
      addedMembers
    );

    // Handle partial success or full success
    // This ensures that the group is still created even if certain members could not be added
    if (failedInsertions.length > 0) {
      res.status(207).json({
        message:
          'Group created successfully but some members could not be added',
        failedMembers: failedInsertions,
      });
    }

    res.status(200).json({
      message: 'Group created',
    });
  } catch (error) {
    console.error('Error creating group chat:', error);
    res
      .status(500)
      .json({ error: 'Error creating group chat. Please try again.' });
  }
};

export const retrieveGroupInfo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const room = req.params.room;
    const groupData = await retrieveGroupInfoWithMembers(room);
    res.status(200).json(groupData);
  } catch (error) {
    console.error('Error retrieving group info:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

export const retrieveMemberUsernames = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const groupId = req.params.groupId;
    const usernames = await getMemberUsernames(Number(groupId));
    res.status(200).json({ memberUsernames: usernames });
  } catch (error) {
    console.error('Error retrieving group member usernames:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

export const markGroupChatAsDeleted = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = Number(req.user?.user_id);
    const room = req.params.room;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    await markGroupAsDeleted(userId, room);
    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Error deleting chat. Please try again.' });
  }
};

// TODO: Use database transactions here to only insert new members in the database if all operations succeed
export const addMembers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const io = req.app.get('io');
    const room = req.params.room;
    const addedMembers = req.body.addedMembers;
    const addedUsersInfo = await addUsersToGroup(io, room, addedMembers);

    // Emit info of added users to update the members list in real-time
    io.to(room).emit('add-members', {
      addedUsersInfo,
    });

    res.status(200).json({
      message: addedMembers.length > 1 ? 'Members added' : 'Member added',
    });
  } catch (error) {
    console.error('Error adding members to group chat:', error);
    res.status(500).json({ error: 'Error adding members. Please try again.' });
  }
};

// Handle a user voluntarily leaving a group chat
export const leaveGroup = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const io = req.app.get('io');
    const groupId = Number(req.params.groupId);
    const userId = Number(req.user?.user_id);
    const socketId = userSockets.get(userId);
    const { room, removedUserId } = await removeMember(io, groupId, userId);

    // Send the user id of the removed member to the frontend
    // This allows for the members list to be updated in real-time for all group chat participants
    io.to(room).emit('remove-member', {
      removedUserId,
    });
    // After a member leaves or is removed, send the room to the frontend so the group can be filtered out of their chat list
    io.to(socketId).emit('remove-group-chat', {
      room: room,
      redirectPath: '/',
    });

    res.status(200).json({
      message: 'You successfully left the group chat',
    });
  } catch (error) {
    console.error('Error leaving group chat:', error);
    res
      .status(500)
      .json({ error: 'Error leaving group chat. Please try again.' });
  }
};

// Used when the group owner removes a member
export const removeGroupMember = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const io = req.app.get('io');
    const groupId = Number(req.params.groupId);
    const userId = Number(req.params.userId);
    const socketId = userSockets.get(userId);
    const { room, removedUserId } = await removeMember(io, groupId, userId);

    // Send the user id of the removed member to the frontend
    // This allows for the members list to be updated in real-time for all group chat participants
    io.to(room).emit('remove-member', {
      removedUserId,
    });
    // After a member leaves or is removed, send the room to the frontend so the group can be filtered out of their chat list
    io.to(socketId).emit('remove-group-chat', {
      room: room,
      redirectPath: '/',
    });

    res.status(200).json({
      message: 'Member successfully removed',
    });
  } catch (error) {
    console.error('Error removing member from group chat:', error);
    res.status(500).json({
      error: 'Error removing member from group chat. Please try again.',
    });
  }
};

export const permanentlyDeleteGroup = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const io = req.app.get('io');
    const groupId = Number(req.params.groupId);
    const { room, memberSocketIds } = await permanentlyDeleteGroupChat(groupId);

    // After a group is permanently deleted, send the room to the frontend so it can be filtered out of each member's chat list
    for (let i = 0; i < memberSocketIds.length; i++) {
      const socketId = memberSocketIds[i];
      io.to(socketId).emit('remove-group-chat', {
        room: room,
        redirectPath: '/',
      });
    }

    res.status(200).json({ message: 'Group successfully deleted' });
  } catch (error) {
    console.error('Error deleting group chat:', error);
    res.status(500).json({
      message: 'Error deleting group chat. Please try again.',
    });
  }
};

export const updateGroupPicture = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const io = req.app.get('io');
    const room = req.params.room;
    const file = req.file as Express.MulterS3.File;
    const groupPictureUrl = await uploadGroupPicture(room, file, io);

    res.status(200).json({
      fileUrl: groupPictureUrl,
      message: 'Group picture successfully updated',
    });
  } catch (error) {
    console.error('Error uploading group picture:', error);
    res
      .status(500)
      .json({ error: 'Error uploading picture. Please try again.' });
  }
};

export const updateUserReadStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = Number(req.user?.user_id);
    const room = req.params.room;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    await addUserToReadList(userId, room);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error adding group member to read list:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

export const updateLastMessageId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const newLastMessageId = req.body.messageId;
    const room = req.params.room;
    await updateLastGroupMessage(newLastMessageId, room);

    res.status(200).json({ success: 'Last message successfully updated' });
  } catch (error) {
    console.error('Error updating last message id:', error);
    res.status(500).json({
      error:
        'There was an error updating your chat list. Please refresh the page.',
    });
  }
};
