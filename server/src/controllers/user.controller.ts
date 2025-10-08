import { Request, Response } from 'express';
import {
  createProfilePictureUrl,
  handleUsernameUpdate,
  retrieveProfilePicture,
  updateProfilePicture,
  updateUserBlockList,
} from '../services/user.service.ts';
import {
  retrieveBlockList,
  retrieveRecipientData,
  retrieveUserIdByUsername,
} from '../services/user.service.ts';

export const retrieveLoggedInUserData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = Number(req.user?.user_id);
    const username = req.user?.username;
    const profilePicture = req.user?.profile_picture;

    const profilePictureUrl = profilePicture
      ? await createProfilePictureUrl(userId, profilePicture)
      : null;

    res.status(200).json({
      userId: userId,
      username: username,
      profilePicture: profilePictureUrl,
    });
  } catch (error) {
    console.error('Error retrieving data of logged in user:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

export const retrieveRecipientProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = Number(req.user?.user_id);
    const room = req.params.room;
    const result = await retrieveRecipientData(userId, room);

    if (!result || !result.recipient) {
      console.error('User does not exist');
      res.status(302).json({ redirectPath: '/' });
      return;
    }

    const { recipient, profilePictureUrl } = result;

    res.status(200).json({
      userId: recipient.user_id,
      username: recipient.username,
      profilePicture: profilePictureUrl,
    });
  } catch (error) {
    console.error('Error retrieving recipient user data', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

export const retrieveIdByUsername = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const username = req.params.username;
    const user = await retrieveUserIdByUsername(username);
    if (!user) {
      throw new Error(
        'User does not exist. Make sure that the username is correct.'
      );
    }
    res.status(200).json({ userId: user.user_id });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message ===
        'User does not exist. Make sure that the username is correct.'
      ) {
        res.status(404).json({ error: error.message });
        return;
      }
    }
    console.error('Error retrieving user ID:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

export const retrieveUserProfilePicture = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    const profilePictureUrl = await retrieveProfilePicture(userId);

    res.status(200).json({ profilePicture: profilePictureUrl });
  } catch (error) {
    console.error('Error retrieving user profile picture:', error);
    res.status(500).json({ error: 'Error retrieving user profile picture' });
  }
};

export const retrieveBlockListById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = Number(req.user?.user_id);
    const result = await retrieveBlockList(userId);
    res.status(200).json({ blockList: result.blocked_users });
  } catch (error) {
    console.error('Error retrieving block list:', error);
    res.status(500).json({ error: 'Error retrieving blocked status' });
  }
};

export const uploadProfilePicture = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    const file = req.file as Express.MulterS3.File;
    const io = req.app.get('io');

    const profilePictureUrl = await updateProfilePicture(userId, file, io);
    res.status(200).json({ fileUrl: profilePictureUrl });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res
      .status(500)
      .json({ error: 'Error uploading profile picture. Please try again.' });
  }
};

export const updateUsername = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = Number(req.user?.user_id);
    const io = req.app.get('io');
    const username = req.body.username;

    await handleUsernameUpdate(username, userId, io);
    res.status(200).json({ success: 'Username updated successfully' });
  } catch (error) {
    console.error('Error updating username:', error);
    res
      .status(500)
      .json({ error: 'Error updating username. Please try again.' });
  }
};

// Update a user's list of blocked users
export const updateBlockedUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const blockedUserIds = req.body.blockedUserIds;
    const userId = Number(req.user?.user_id);

    await updateUserBlockList(blockedUserIds, userId);
    res.status(200).json({ success: 'Block list successfully updated' });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: 'Error blocking user. Please try again.' });
  }
};
