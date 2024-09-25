import { User } from '../../models/user-model.mjs';
import { createPresignedUrl } from '../../services/s3-file-handler.mjs';

const retrieveUserById = async (req, res) => {
  try {
    const userId = req.session.passport.user;
    const user = await User.getUserById(userId);
    res.status(200).json({ userId: user.id, username: user.username });
  } catch (error) {
    console.error('Error retrieving user data:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

const retrieveIdByUsername = async (req, res) => {
  try {
    const username = req.body.username;
    const user = await User.getIdByUsername(username);
    if (!user) {
      throw new Error('User does not exist. Make sure that the username is correct.');
    }
    res.status(200).json({ userId: user.id});
  } catch (error) {
    if (error.message === 'User does not exist. Make sure that the username is correct.') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Error retrieving user ID:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

const retrieveUserIdFromSession = async (req, res) => {
  if (req.session.passport && req.session.passport.user) {
    res.json({ userId: req.session.passport.user });
  } else {
    res.json({ error: 'User not authenticated.' });
  }
};

const retrieveProfilePictureById = async (req, res) => {
  try {
    const userId = req.session.passport.user;
    const fileName = await User.getUserProfilePicture(userId);

    // If the user has not uploaded a profile picture, send a 204 response
    if (fileName === null) {
      return res.status(204).send();
    }

    // Generate a temporary URL for viewing the uploaded profile picture from S3
    const presignedS3Url = await createPresignedUrl(process.env.BUCKET_NAME, fileName);
    res.status(200).json({ fileUrl: presignedS3Url });
  } catch (error) {
    console.error('Error retrieving profile picture:', error);
    res.status(500).json({ error: 'Error retrieving profile picture' });
  }
}

const retrieveBlockListById = async (req, res) => {
  try {
    const userId = req.session.passport.user;
    const blockList = await User.getBlockListById(userId);
    res.status(200).json({ blockList: blockList });
  } catch (error) {
    console.error('Error retrieving block list:', error);
    res.status(500).json({ error: 'Error retrieving blocked status' });
  }
};

export {
  retrieveUserById,
  retrieveIdByUsername,
  retrieveUserIdFromSession,
  retrieveProfilePictureById,
  retrieveBlockListById
};
