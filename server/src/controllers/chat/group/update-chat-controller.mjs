import { userSockets } from '../../../handlers/socket-handlers.mjs';
import { GroupMember } from '../../../models/group-member-model.mjs';
import { Group } from '../../../models/group-model.mjs';
import { deleteS3Object } from '../../../services/s3/s3-file-handler.mjs';
import { createPresignedUrl } from '../../../services/s3/s3-presigned-url.mjs';
import createGroupPictureUrl from '../../../utils/create-group-picture-url.mjs';
import { retrieveUserById } from '../../user/get-user-controller.mjs';

// TODO: Use database transactions here to only insert new members in the database if all operations succeed
const addMembers = async (req, res) => {
  try {
    const io = req.app.get('io');
    const addedMembers = req.body.addedMembers;
    const room = req.params.room;
    const groupInfo = await Group.retrieveGroupInfoByRoom(room);

    // Add members to the group chat
    const insertGroupMembers = addedMembers.map((user) =>
      GroupMember.insertGroupMember(groupInfo.group_id, user.userId, user.role)
    );
    const insertedGroupMembers = await Promise.all(insertGroupMembers);

    const addedUsersInfo = await notifyAddedUsers(
      io,
      insertedGroupMembers,
      groupInfo,
      room
    );

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
const removeGroupMember = async (req, res) => {
  try {
    const io = req.app.get('io');
    const groupId = req.params.groupId;
    const userId = req.params.userId;
    const { room } = await Group.retrieveRoomByGroupId(groupId);

    const removedUser = await GroupMember.removeGroupMember(groupId, userId);
    await Group.removeUserFromReadList(userId, room);

    // Send the user id of the removed member to the frontend through a socket event
    // This allows for the members list to be updated in real-time for all group chat participants
    io.to(room).emit('remove-member', {
      removedUserId: removedUser.user_id,
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

const uploadPicture = async (req, res) => {
  try {
    const io = req.app.get('io');
    const room = req.params.room;

    // Delete previous picture from S3 storage
    const fileName = await Group.retrievePicture(room);
    if (!(fileName === null)) {
      // Only run if a picture exists
      await deleteS3Object(process.env.BUCKET_NAME, fileName);
    }

    // Upload new picture
    await Group.updatePicture(req.file.key, room);

    // Generate a temporary URL for viewing the uploaded picture from S3
    const presignedS3Url = await createPresignedUrl(
      process.env.BUCKET_NAME,
      req.file.key
    );

    await updateGroupPicture(io, room, presignedS3Url);

    return res.status(200).json({
      fileUrl: presignedS3Url,
      message: 'Group picture successfully updated',
    });
  } catch (error) {
    console.error('Error uploading group picture:', error);
    if (res) {
      return res
        .status(500)
        .json({ error: 'Error uploading picture. Please try again.' });
    }
  }
};

const updateUserReadStatus = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const room = req.params.room;

    await Group.markUserAsRead(userId, room);
    return res.sendStatus(200);
  } catch (error) {
    console.error('Error adding group member to read list:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

// Update the last message id for a group chat, used when last message is deleted
const updateLastMessageId = async (req, res) => {
  try {
    const newLastMessageId = req.body.messageId;
    const room = req.params.room;

    await Group.updateLastMessage(newLastMessageId, room);
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

// Update the picture of a group for all its members in real-time
const updateGroupPicture = async (io, room, groupPicture) => {
  io.to(room).emit('update-group-picture', {
    groupPicture,
    room,
  });
};

// Retrieve the info of each added user and notify them that they were added
const notifyAddedUsers = async (io, insertedGroupMembers, groupInfo, room) => {
  const groupPictureUrl = await createGroupPictureUrl(groupInfo.group_picture);
  const addedUsersInfo = [];

  for (const member of insertedGroupMembers) {
    const user = await retrieveUserById(member.user_id);
    addedUsersInfo.push(user);

    if (userSockets.has(user.user_id)) {
      const socket = userSockets.get(user.user_id);
      io.to(socket).emit('add-group-to-chat-list', {
        chat_id: `g_${groupInfo.group_id}`,
        chat_picture: groupPictureUrl,
        chat_type: 'group',
        deleted: false,
        last_message_content: 'You were added',
        last_message_id: null,
        last_message_time: null,
        name: groupInfo.name,
        read: false,
        recipient_user_id: null,
        room,
        updated_at: new Date(),
      });
    }
  }

  return addedUsersInfo;
};

export {
  addMembers,
  removeGroupMember,
  uploadPicture,
  updateUserReadStatus,
  updateLastMessageId,
  updateGroupPicture,
};
