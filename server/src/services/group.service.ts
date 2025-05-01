import { Server } from 'socket.io';
import { Group } from '../models/group.model.ts';
import {
  GroupInfoWithMembers,
  GroupMemberInsertionResult,
  GroupParticipant,
} from '../types/group.js';
import createGroupPictureUrl from '../utils/create-group-picture-url.ts';
import { createPresignedUrl, deleteS3Object } from './s3.service.ts';
import { retrieveUserById } from '../controllers/user/get-user.controller.ts';
import { userSockets } from '../handlers/socket-handlers.ts';
import { GroupMember } from '../models/group-member.model.ts';
import {
  GroupInfo,
  NewGroupChat,
  NewGroupMember,
  RemovedGroupMember,
} from '../schemas/group.schema.ts';
import { AddedUserInfo, GroupMemberToBeAdded } from '../types/group.js';

export const retrieveGroupInfoWithMembers = async (
  room: string
): Promise<GroupInfoWithMembers> => {
  const groupInfo = await Group.retrieveGroupInfoByRoom(room);
  const groupMembersInfo = await retrieveGroupMembersInfo(groupInfo.group_id);
  const groupPictureUrl = groupInfo.group_picture
    ? await createGroupPictureUrl(groupInfo.group_picture)
    : null;

  return {
    info: {
      chatId: groupInfo.group_id,
      name: groupInfo.name,
      groupPicture: groupPictureUrl,
    },
    members: groupMembersInfo,
  };
};

export const retrieveGroupMembersInfo = async (
  groupId: number
): Promise<GroupParticipant[]> => {
  const groupMembersInfo = (await Group.retrieveMembersInfo(
    groupId
  )) as GroupParticipant[];

  // Create a presigned S3 url for each group member's profile picture
  for (let i = 0; i < groupMembersInfo.length; i++) {
    const groupMember = groupMembersInfo[i];
    if (groupMember.profile_picture) {
      groupMember.profile_picture = await createPresignedUrl(
        process.env.BUCKET_NAME!,
        groupMember.profile_picture
      );
    }
  }

  return groupMembersInfo;
};

export const getMemberUsernames = async (
  groupId: number
): Promise<string[]> => {
  const groupMembersInfo = await Group.retrieveMembersInfo(groupId);
  return groupMembersInfo.map((member: GroupParticipant) => member.username);
};

export const createNewGroup = async (
  io: Server,
  ownerUserId: number,
  groupName: string,
  room: string,
  addedMembers: GroupMemberToBeAdded[]
): Promise<GroupMemberInsertionResult[]> => {
  const newGroupChat: NewGroupChat = await Group.insertNewGroupChat(
    ownerUserId,
    groupName,
    room
  );

  // Add members to the group chat concurrently
  const insertGroupMembers = addedMembers.map((user) =>
    GroupMember.insertGroupMember(newGroupChat.group_id, user.userId, user.role)
  );
  const insertedGroupMembers: GroupMemberInsertionResult[] =
    await Promise.allSettled(insertGroupMembers);

  // Log failed insertions
  const failedInsertions: GroupMemberInsertionResult[] = [];
  for (let i = 0; i < insertedGroupMembers.length; i++) {
    if (insertedGroupMembers[i].status === 'rejected') {
      console.error(`Failed to add user ${insertedGroupMembers[i]}`);
      failedInsertions.push(insertedGroupMembers[i]);
    }
  }

  broadcastGroupCreation(io, insertedGroupMembers, newGroupChat);

  return failedInsertions;
};

export const addUsersToGroup = async (
  io: Server,
  room: string,
  addedMembers: GroupMemberToBeAdded[]
): Promise<AddedUserInfo[]> => {
  const groupInfo = await Group.retrieveGroupInfoByRoom(room);

  // Add members to the group chat
  const insertGroupMembers = addedMembers.map((user) =>
    GroupMember.insertGroupMember(groupInfo.group_id, user.userId, user.role)
  );
  const insertedGroupMembers = await Promise.all(insertGroupMembers);

  return await notifyAddedUsers(io, insertedGroupMembers, groupInfo, room);
};

export const removeMember = async (
  groupId: number,
  userId: number
): Promise<{ room: string; removedUser: RemovedGroupMember }> => {
  const { room } = await Group.retrieveRoomByGroupId(groupId);
  const removedUser = await GroupMember.removeGroupMember(groupId, userId);
  await Group.removeUserFromReadList(userId, room);

  return { room, removedUser };
};

export const uploadGroupPicture = async (
  room: string,
  file: Express.MulterS3.File,
  io: Server
): Promise<string> => {
  // Delete previous picture from S3 storage
  const fileName = await Group.retrievePicture(room);
  if (!(fileName === null)) {
    // Only run if a picture exists
    await deleteS3Object(process.env.BUCKET_NAME!, fileName);
  }

  // Upload new picture
  await Group.updatePicture(file.key, room);

  // Generate a temporary URL for viewing the uploaded picture from S3
  const presignedS3Url = await createPresignedUrl(
    process.env.BUCKET_NAME!,
    file.key
  );

  await emitGroupPictureUpdate(io, room, presignedS3Url);

  return presignedS3Url;
};

export const addUserToReadList = async (
  userId: number,
  room: string
): Promise<void> => {
  return await Group.markUserAsRead(userId, room);
};

export const setLastMessageId = async (
  newLastMessageId: number,
  room: string
): Promise<void | null> => {
  return await Group.updateLastMessage(newLastMessageId, room);
};

export const markGroupAsDeleted = async (
  userId: number,
  room: string
): Promise<void> => {
  return await Group.updateDeletedForList(userId, room);
};

// Update the picture of a group for all its members in real-time
const emitGroupPictureUpdate = async (
  io: Server,
  room: string,
  groupPicture: string
) => {
  io.to(room).emit('update-group-picture', {
    groupPicture,
    room,
  });
};

// Retrieve the info of each added user and notify them that they were added
const notifyAddedUsers = async (
  io: Server,
  insertedGroupMembers: NewGroupMember[],
  groupData: GroupInfo | NewGroupChat,
  room: string
): Promise<AddedUserInfo[]> => {
  const groupPictureUrl =
    'group_picture' in groupData && groupData.group_picture
      ? await createGroupPictureUrl(groupData.group_picture)
      : null;
  const addedUsersInfo: AddedUserInfo[] = [];

  for (const member of insertedGroupMembers) {
    const user = await retrieveUserById(member.user_id);
    addedUsersInfo.push(user);

    if (userSockets.has(user.user_id)) {
      const socketId = userSockets.get(user.user_id);
      if (socketId) {
        io.to(socketId).emit('add-group-to-chat-list', {
          chat_id: `g_${groupData.group_id}`,
          chat_picture: groupPictureUrl,
          chat_type: 'group',
          deleted: false,
          last_message_content: 'You were added',
          last_message_id: null,
          last_message_time: null,
          name: groupData.name,
          read: false,
          recipient_user_id: null,
          room,
          updated_at: new Date(),
        });
      }
    }
  }

  return addedUsersInfo;
};

// When a new group chat is created, add it to the chat list of the owner and all users added during creation
const broadcastGroupCreation = (
  io: Server,
  insertedGroupMembers: GroupMemberInsertionResult[],
  newGroupChat: NewGroupChat
): void => {
  for (const member of insertedGroupMembers) {
    if (member.value) {
      if (userSockets.has(member.value.user_id)) {
        const socketId = userSockets.get(member.value.user_id);
        if (socketId) {
          io.to(socketId).emit('add-group-to-chat-list', {
            chat_id: `g_${newGroupChat.group_id}`,
            chat_picture: null,
            chat_type: 'group',
            deleted: false,
            last_message_content:
              member.value.role === 'owner'
                ? `You created ${newGroupChat.name}`
                : 'You were added',
            last_message_id: null,
            last_message_time: null,
            name: newGroupChat.name,
            read: false,
            recipient_user_id: null,
            room: newGroupChat.room,
            updated_at: new Date(),
          });
        }
      }
    }
  }
};
