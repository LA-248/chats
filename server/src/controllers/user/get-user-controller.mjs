import { User } from '../../models/user-model.mjs';
import { createPresignedUrl } from '../../services/s3/s3-presigned-url.mjs';

const retrieveLoggedInUserDataById = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const username = req.user.username;
    const profilePicture = req.user.profile_picture;

    const profilePictureUrl = profilePicture
      ? await createPresignedUrl(process.env.BUCKET_NAME, profilePicture)
      : null;

    res.status(200).json({
      userId: userId,
      username: username,
      profilePicture: profilePictureUrl,
    });
  } catch (error) {
    console.error('Error retrieving user data:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

const retrieveRecipientProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const room = req.params.room;
    const user = await User.getRecipientUserProfile(userId, room);
    console.log(user);

    if (!user) {
      console.error('User does not exist');
      return res.status(302).json({ redirectPath: '/' });
    }

    const profilePictureUrl = user.profile_picture
      ? await createPresignedUrl(process.env.BUCKET_NAME, user.profile_picture)
      : null;

    res.status(200).json({
      userId: user.user_id,
      username: user.username,
      profilePicture: profilePictureUrl,
    });
  } catch (error) {
    console.error('Error retrieving user data:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

const retrieveIdByUsername = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.getIdByUsername(username);
    if (!user) {
      throw new Error(
        'User does not exist. Make sure that the username is correct.'
      );
    }
    res.status(200).json({ userId: user.user_id });
  } catch (error) {
    if (
      error.message ===
      'User does not exist. Make sure that the username is correct.'
    ) {
      return res.status(404).json({ error: error.message });
    }
    console.error('Error retrieving user ID:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

const retrieveBlockListById = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const blockList = await User.getBlockListById(userId);
    res.status(200).json({ blockList: blockList });
  } catch (error) {
    console.error('Error retrieving block list:', error);
    res.status(500).json({ error: 'Error retrieving blocked status' });
  }
};

export {
  retrieveLoggedInUserDataById,
  retrieveRecipientProfile,
  retrieveIdByUsername,
  retrieveBlockListById,
};
