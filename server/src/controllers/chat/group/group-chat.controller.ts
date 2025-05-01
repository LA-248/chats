import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  addUsersToGroup,
  addUserToReadList,
  getMemberUsernames,
  markGroupAsDeleted,
  removeMember,
  retrieveGroupInfoWithMembers,
  setLastMessageId,
  uploadGroupPicture,
} from '../../../services/group.service.ts';
import { createNewGroup } from '../../../services/group.service.ts';

// Handle creating a group chat
export const createGroupChat = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const io = req.app.get('io');
    const ownerUserId = req.body.loggedInUserId;
    const groupName = req.body.groupName;
    const room = uuidv4();
    const addedMembers = req.body.addedMembers;

    const result = await createNewGroup(
      io,
      ownerUserId,
      groupName,
      room,
      addedMembers
    );

    // Handle partial success or full success
    // This ensures that the group is still created even if certain members could not be added
    if (result.length > 0) {
      return res.status(207).json({
        message:
          'Group created successfully but some members could not be added',
        failedMembers: result,
      });
    }

    return res.status(200).json({
      message: 'Group created',
    });
  } catch (error) {
    console.error('Error creating group chat:', error);
    return res
      .status(500)
      .json({ error: 'Error creating group chat. Please try again.' });
  }
};

export const retrieveGroupInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const room = req.params.room;
    const groupData = await retrieveGroupInfoWithMembers(room);
    return res.status(200).json(groupData);
  } catch (error) {
    console.error('Error retrieving group info:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

export const retrieveMemberUsernames = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const groupId = req.params.groupId;
    const usernames = await getMemberUsernames(Number(groupId));
    return res.status(200).json({ memberUsernames: usernames });
  } catch (error) {
    console.error('Error retrieving group member usernames:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

export const deleteGroupChat = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?.user_id;
    const room = req.params.room;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    await markGroupAsDeleted(Number(userId), room);
    return res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return res
      .status(500)
      .json({ error: 'Error deleting chat. Please try again.' });
  }
};

// TODO: Use database transactions here to only insert new members in the database if all operations succeed
export const addMembers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const io = req.app.get('io');
    const room = req.params.room;
    const addedMembers = req.body.addedMembers;
    const addedUsersInfo = await addUsersToGroup(io, room, addedMembers);

    // Emit info of added users to update the members list in real-time
    io.to(room).emit('add-members', {
      addedUsersInfo,
    });
    return res.status(200).json({
      message: addedMembers.length > 1 ? 'Members added' : 'Member added',
    });
  } catch (error) {
    console.error('Error adding members to group chat:', error);
    return res
      .status(500)
      .json({ error: 'Error adding members. Please try again.' });
  }
};

// Used when a user voluntarily leaves a group chat
export const removeGroupMember = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const io = req.app.get('io');
    const groupId = Number(req.params.groupId);
    const userId = Number(req.params.userId);
    const { room, removedUser } = await removeMember(groupId, userId);

    // Send the user id of the removed member to the frontend through a socket event
    // This allows for the members list to be updated in real-time for all group chat participants
    io.to(room).emit('remove-member', {
      removedUserId: removedUser,
    });

    return res
      .status(200)
      .json({ message: 'You successfully left the group chat' });
  } catch (error) {
    console.error('Error leaving group chat:', error);
    return res
      .status(500)
      .json({ error: 'Error leaving group chat. Please try again.' });
  }
};

export const updateGroupPicture = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const io = req.app.get('io');
    const room = req.params.room;
    const file = req.file as Express.MulterS3.File;
    const groupPictureUrl = await uploadGroupPicture(room, file, io);

    return res.status(200).json({
      fileUrl: groupPictureUrl,
      message: 'Group picture successfully updated',
    });
  } catch (error) {
    console.error('Error uploading group picture:', error);

    return res
      .status(500)
      .json({ error: 'Error uploading picture. Please try again.' });
  }
};

export const updateUserReadStatus = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user?.user_id);
    const room = req.params.room;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    await addUserToReadList(userId, room);
    return res.sendStatus(200);
  } catch (error) {
    console.error('Error adding group member to read list:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

// Update the last message id for a group chat, used when last message is deleted
export const updateLastMessageId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const newLastMessageId = req.body.messageId;
    const room = req.params.room;
    await setLastMessageId(newLastMessageId, room);

    return res
      .status(200)
      .json({ success: 'Last message successfully updated' });
  } catch (error) {
    console.error('Error updating last message id:', error);
    return res.status(500).json({
      error:
        'There was an error updating your chat list. Please refresh the page.',
    });
  }
};
