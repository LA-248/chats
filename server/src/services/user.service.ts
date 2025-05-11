import { Server } from 'socket.io';
import { User } from '../models/user.model.ts';
import { createPresignedUrl, deleteS3Object } from './s3.service.ts';
import { PrivateChat } from '../models/private-chat.model.ts';
import {
  RecipientUserProfile,
  UserBlockList,
  UserId,
  UserProfile,
} from '../schemas/user.schema.ts';

export const retrieveProfilePictureUrl = async (
  profilePicture: string
): Promise<string | null> => {
  return profilePicture
    ? await createPresignedUrl(process.env.BUCKET_NAME!, profilePicture)
    : null;
};

export const retrieveRecipientData = async (
  userId: number,
  room: string
): Promise<{
  user: RecipientUserProfile;
  profilePictureUrl: string | null;
} | null> => {
  const user = await User.getRecipientUserProfile(userId, room);
  if (!user) return null;

  const profilePictureUrl = user.profile_picture
    ? await createPresignedUrl(process.env.BUCKET_NAME!, user.profile_picture)
    : null;

  return { user, profilePictureUrl };
};

export const retrieveUserById = async (id: number): Promise<UserProfile> => {
  try {
    const user = await User.getUserById(id);
    const userId = user.user_id;
    const username = user.username;

    const profilePictureUrl = user.profile_picture
      ? await createPresignedUrl(process.env.BUCKET_NAME!, user.profile_picture)
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
  return await User.getIdByUsername(username);
};

export const retrieveBlockList = async (
  userId: number
): Promise<UserBlockList | null> => {
  return await User.getBlockListById(userId);
};

export const updateProfilePicture = async (
  userId: number,
  file: Express.MulterS3.File,
  io: Server
): Promise<string> => {
  // Delete previous profile picture from S3 storage
  const currentProfilePicture = await User.getUserProfilePicture(userId);
  if (!(currentProfilePicture === null)) {
    // Only run if a current profile picture exists
    await deleteS3Object(process.env.BUCKET_NAME!, currentProfilePicture);
  }

  await User.updateProfilePictureById(file.key, userId);
  const profilePictureUrl = await createPresignedUrl(
    process.env.BUCKET_NAME!,
    file.key
  );
  await updateProfilePictureForAllContacts(userId, io, profilePictureUrl);
  return profilePictureUrl;
};

export const handleUsernameUpdate = async (
  username: string,
  userId: number,
  io: Server
): Promise<void> => {
  await User.updateUsernameById(username, userId);
  return await updateUsernameForAllContacts(userId, io, username);
};

export const updateUserBlockList = async (
  blockedUserIds: number[],
  userId: number
): Promise<void> => {
  return await User.updateBlockedUsersById(blockedUserIds, userId);
};

// Update profile picture for all the user's contacts in real-time
const updateProfilePictureForAllContacts = async (
  userId: number,
  io: Server,
  profilePicture: string
): Promise<void> => {
  const rooms = await PrivateChat.retrieveAllRoomsByUser(userId);
  const roomIds = rooms.map((row) => row);

  for (let i = 0; i < roomIds.length; i++) {
    const room = roomIds[i];
    if (room) {
      io.to(room).emit('update-profile-picture-for-contacts', {
        userId,
        profilePicture,
        room,
      });
    }
  }
};

// Update username for all the user's contacts in real-time
const updateUsernameForAllContacts = async (
  userId: number,
  io: Server,
  newUsername: string
): Promise<void> => {
  const rooms = await PrivateChat.retrieveAllRoomsByUser(userId);
  const roomIds = rooms.map((row) => row);

  for (let i = 0; i < roomIds.length; i++) {
    const room = roomIds[i];
    if (room) {
      io.to(room).emit('update-username-for-contacts', {
        userId,
        newUsername,
        room,
      });
    }
  }
};
