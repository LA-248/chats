import { Server } from 'socket.io';
import { User } from '../repositories/user.repository.ts';
import { createPresignedUrl, deleteS3Object } from './s3.service.ts';
import { PrivateChat } from '../models/private-chat.model.ts';
import {
  RecipientUserProfile,
  UserBlockList,
  UserId,
  UserProfile,
} from '../schemas/user.schema.ts';
import { Group } from '../models/group.model.ts';
import { S3AvatarStoragePath } from '../types/chat.ts';

export const createProfilePictureUrl = async (
  userId: number,
  profilePicture: string
): Promise<string | null> => {
  return profilePicture
    ? await createPresignedUrl(
        process.env.BUCKET_NAME!,
        `${S3AvatarStoragePath.USER_AVATARS}/${userId}/${profilePicture}`
      )
    : null;
};

export const retrieveRecipientData = async (
  userId: number,
  room: string
): Promise<{
  recipient: RecipientUserProfile;
  profilePictureUrl: string | null;
} | null> => {
  const userRepository = new User();
  const recipient = await userRepository.findRecipientUserProfileById(
    userId,
    room
  );
  console.log(recipient);
  if (!recipient) return null;

  const profilePictureUrl = recipient.profile_picture
    ? await createPresignedUrl(
        process.env.BUCKET_NAME!,
        `${S3AvatarStoragePath.USER_AVATARS}/${recipient.user_id}/${recipient.profile_picture}`
      )
    : null;

  return { recipient, profilePictureUrl };
};

export const retrieveUserById = async (id: number): Promise<UserProfile> => {
  try {
    const userRepository = new User();
    const user = await userRepository.findUserById(id);
    const userId = user.user_id;
    const username = user.username;

    const profilePictureUrl = user.profile_picture
      ? await createPresignedUrl(
          process.env.BUCKET_NAME!,
          `${S3AvatarStoragePath.USER_AVATARS}/${userId}/${user.profile_picture}`
        )
      : null;

    return { user_id: userId, username, profile_picture: profilePictureUrl };
  } catch (error) {
    console.error('Error retrieving user data:', error);
    throw error;
  }
};

export const retrieveUserIdByUsername = async (
  username: string
): Promise<UserId | null> => {
  const userRepository = new User();
  return await userRepository.findUserIdByUsername(username);
};

export const retrieveProfilePicture = async (userId: number) => {
  const userRepository = new User();
  const result = await userRepository.findUserProfilePictureById(userId);
  const profilePicture = result.profile_picture;

  return profilePicture
    ? await createProfilePictureUrl(userId, profilePicture)
    : null;
};

export const retrieveBlockList = async (
  userId: number
): Promise<UserBlockList> => {
  const userRepository = new User();
  return await userRepository.findBlockListById(userId);
};

export const updateProfilePicture = async (
  userId: number,
  file: Express.MulterS3.File,
  io: Server
): Promise<string> => {
  const userRepository = new User();

  // Delete previous profile picture from S3 storage
  const currentProfilePicture = await userRepository.findUserProfilePictureById(
    userId
  );
  if (!(currentProfilePicture === null)) {
    // Only run if a current profile picture exists
    await deleteS3Object(
      process.env.BUCKET_NAME!,
      `${S3AvatarStoragePath.USER_AVATARS}/${userId}/${currentProfilePicture}`
    );
  }

  await userRepository.updateProfilePictureById(file.originalname, userId);
  const profilePictureUrl = await createPresignedUrl(
    process.env.BUCKET_NAME!,
    file.key
  );

  await updateUserInfoForAllContacts(
    userId,
    io,
    profilePictureUrl,
    'update-profile-picture-for-contacts'
  );
  await updateUserInfoInAllGroups(
    userId,
    io,
    profilePictureUrl,
    'update-profile-picture-in-groups'
  );

  return profilePictureUrl;
};

export const handleUsernameUpdate = async (
  username: string,
  userId: number,
  io: Server
): Promise<void> => {
  const userRepository = new User();
  await userRepository.updateUsernameById(username, userId);

  await updateUserInfoForAllContacts(
    userId,
    io,
    username,
    'update-username-for-contacts'
  );
  await updateUserInfoInAllGroups(
    userId,
    io,
    username,
    'update-username-in-groups'
  );
  return;
};

export const updateUserBlockList = async (
  blockedUserIds: number[],
  userId: number
): Promise<void> => {
  const userRepository = new User();
  return await userRepository.updateBlockedUsersById(blockedUserIds, userId);
};

// Update profile picture or username for all the user's private chats in real-time
const updateUserInfoForAllContacts = async (
  userId: number,
  io: Server,
  newInfo: string,
  socketEvent: string
): Promise<void> => {
  const rooms = await PrivateChat.retrieveAllRoomsByUser(userId);

  for (let i = 0; i < rooms.length; i++) {
    const room = rooms[i];
    if (room) {
      io.to(room).emit(socketEvent, {
        userId,
        newInfo,
        room,
      });
    }
  }
};

// Update profile picture or username in all groups the user is a member of in real-time
const updateUserInfoInAllGroups = async (
  userId: number,
  io: Server,
  newInfo: string,
  socketEvent: string
): Promise<void> => {
  const rooms = await Group.retrieveAllGroupsByUser(userId);

  for (let i = 0; i < rooms.length; i++) {
    const room = rooms[i];
    if (room) {
      io.to(room).emit(socketEvent, {
        userId,
        newInfo,
        room,
      });
    }
  }
};
