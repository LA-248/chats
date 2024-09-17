import { User } from '../../models/user-model.mjs';
import { createPresignedUrl } from '../../services/s3-file-handler.mjs';

const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.session.passport.user;
    await User.updateProfilePictureById(req.file.key, userId);

    // Generate a temporary URL for viewing the uploaded profile picture from S3
    const presignedS3Url = await createPresignedUrl(process.env.BUCKET_NAME, req.file.key);
    res.status(200).json({ fileUrl: presignedS3Url });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ error: 'Error uploading profile picture. Please try again.' });
  }
};

const updateUsernameById = async (req, res) => {
  try {
    const userId = req.session.passport.user;
    const username = req.body.username;
    await User.updateUsernameById(username, userId);
    res.status(200).json({ success: 'Username updated successfully' });
  } catch (error) {
    console.error('Error updating username:', error);
    res.status(500).json({ error: 'Error updating username. Please try again.' });
  }
};

const updateBlockedUsers = async (req, res) => {
  try {
    const userId = req.session.passport.user;
    const blockedUserIds = req.body.blockedUserIds;
    await User.updateBlockedUsersById(blockedUserIds, userId);
    res.status(200).json({ success: 'Block list successfully updated' });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: 'Error blocking user. Please try again.' });
  }
};

export { uploadProfilePicture, updateUsernameById, updateBlockedUsers };
