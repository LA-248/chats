import { Server } from 'socket.io';
import { Group } from '../models/group.model.ts';
import {
  GroupInfoWithMembers,
  GroupMemberInsertionResult,
  GroupParticipant,
  GroupMemberRole,
} from '../types/group.ts';
import createGroupPictureUrl from '../utils/create-group-picture-url.ts';
import { createPresignedUrl, deleteS3Object } from './s3.service.ts';
import { retrieveUserById } from './user.service.ts';
import { userSockets } from '../handlers/socket-handlers.ts';
import { GroupMember } from '../models/group-member.model.ts';
import {
  GroupInfo,
  GroupMemberPartialInfo,
  NewGroupChat,
  NewGroupMember,
  RemovedGroupMember,
} from '../schemas/group.schema.ts';
import { AddedUserInfo, GroupMemberToBeAdded } from '../types/group.ts';

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
      console.error(`Failed to add user ${insertedGroupMembers[i].reason}`);
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

// Handles removing a member that voluntarily left a group
export const removeMemberWhoLeft = async (
  io: Server,
  groupId: number,
  userId: number
): Promise<{
  room: string;
  removedUser: RemovedGroupMember;
  newGroupOwner: GroupMemberPartialInfo;
}> => {
  const socketId = userSockets.get(userId);
  let newGroupOwner: GroupMemberPartialInfo = { user_id: 0, role: '' };

  const room = await Group.retrieveRoomByGroupId(groupId);
  const removedUser = await GroupMember.removeGroupMember(groupId, userId);
  await Group.removeUserFromReadList(userId, room);

  // If the user who left the group was the owner, randomly assign another member as the new owner
  if (removedUser.role === GroupMemberRole.OWNER) {
    const groupMemberInfo = await GroupMember.retrieveRandomMember(
      room,
      groupId
    );
    const groupMemberUserId = groupMemberInfo.user_id;

    newGroupOwner = await GroupMember.updateRole(
      GroupMemberRole.OWNER,
      groupId,
      groupMemberUserId
    );
    await Group.updateOwner(newGroupOwner.user_id, groupId, room);
  }

  if (socketId) {
    // Remove socket of removed member from the room
    const memberSocket = io.sockets.sockets.get(socketId);
    memberSocket?.leave(room);
  }

  return { room, removedUser, newGroupOwner };
};

export const kickMember = async (
  io: Server,
  groupId: number,
  userId: number,
  loggedInUserId: number
): Promise<{ room: string; removedUser: RemovedGroupMember }> => {
  const socketId = userSockets.get(userId);
  const room = await Group.retrieveRoomByGroupId(groupId);
  const kicker = await GroupMember.retrieveMemberByUserId(
    room,
    groupId,
    loggedInUserId
  );
  const memberToBeRemoved = await GroupMember.retrieveMemberByUserId(
    room,
    groupId,
    userId
  );

  // Make sure the member performing the kick can only do so to those with a lower role than theirs
  if (
    memberToBeRemoved.role === kicker.role ||
    memberToBeRemoved.role === GroupMemberRole.OWNER
  ) {
    throw new Error('You may not kick this member');
  }

  const removedUser = await GroupMember.removeGroupMember(groupId, userId);
  await Group.removeUserFromReadList(userId, room);

  // Remove socket of removed member from the room
  if (socketId) {
    const memberSocket = io.sockets.sockets.get(socketId);
    memberSocket?.leave(room);
  }

  return { room, removedUser };
};

export const updateMemberRole = async (
  newRole: string,
  groupId: number,
  userId: number
): Promise<{ room: string; newAdmin: GroupMemberPartialInfo }> => {
  const room = await Group.retrieveRoomByGroupId(groupId);
  const newAdmin = await GroupMember.updateRole(newRole, groupId, userId);

  return { room, newAdmin };
};

export const permanentlyDeleteGroupChat = async (
  groupId: number
): Promise<{ room: string; memberSocketIds: string[] }> => {
  const membersInfo = await Group.retrieveMembersInfo(groupId);
  const memberUserIds = membersInfo.map((member) => member.user_id);
  const room = await Group.retrieveRoomByGroupId(groupId);
  const memberSocketIds = [];

  // Get the socket IDs of each group member
  for (let i = 0; i < memberUserIds.length; i++) {
    const memberUserId = memberUserIds[i];
    const socketId = userSockets.get(memberUserId);
    if (socketId) {
      memberSocketIds.push(socketId);
    }
  }

  await Group.permanentlyDelete(groupId);

  return { room, memberSocketIds };
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

// Update the last message in a group chat, used when the most recent message is deleted
export const updateLastGroupMessage = async (
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
    const addedUser = await retrieveUserById(member.user_id);
    addedUsersInfo.push(addedUser);

    if (userSockets.has(addedUser.user_id)) {
      // Get the socket ID of each member added to the group
      const addedUserSocketId = userSockets.get(addedUser.user_id);
      if (addedUserSocketId) {
        io.to(addedUserSocketId).emit('add-group-to-chat-list', {
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
        const memberSocket = io.sockets.sockets.get(addedUserSocketId);
        memberSocket?.join(room);
      }
    }
  }

  return addedUsersInfo;
};

// When a new group chat is created, add it to the chat lists of the creator and all users who were added during creation
const broadcastGroupCreation = (
  io: Server,
  insertedGroupMembers: GroupMemberInsertionResult[],
  newGroupChat: NewGroupChat
): void => {
  for (const member of insertedGroupMembers) {
    if (member.value) {
      if (userSockets.has(member.value.user_id)) {
        // Get the socket ID of each member added to the group
        const socketId = userSockets.get(member.value.user_id);
        if (socketId) {
          // This structure is used as it mirrors the one returned when fetching a user's chats from the database to build their chat list
          // Ensures uniform handling of chat items in the frontend chat list
          io.to(socketId).emit('add-group-to-chat-list', {
            chat_id: `g_${newGroupChat.group_id}`,
            chat_picture: null,
            chat_type: 'group',
            deleted: false,
            last_message_content:
              member.value.role === GroupMemberRole.OWNER
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
          const memberSocket = io.sockets.sockets.get(socketId);
          memberSocket?.join(newGroupChat.room);
        }
      }
    }
  }
};
