import { PrivateChat } from '../../models/private-chat-model.mjs';
import { User } from '../../models/user-model.mjs';
import { deleteS3Object } from '../../services/s3/s3-file-handler.mjs';
import { createPresignedUrl } from '../../services/s3/s3-presigned-url.mjs';

const uploadProfilePicture = async (req, res) => {
  try {
    const io = req.app.get('io');
    const userId = req.user.user_id;

    // Delete previous profile picture from S3 storage
    const fileName = await User.getUserProfilePicture(userId);
    if (!(fileName === null)) {
      // Only run if a previous profile picture exists
      await deleteS3Object(process.env.BUCKET_NAME, fileName);
    }

    // Upload new profile picture
    await User.updateProfilePictureById(req.file.key, userId);

    // Generate a temporary URL for viewing the uploaded profile picture from S3
    const presignedS3Url = await createPresignedUrl(
      process.env.BUCKET_NAME,
      req.file.key
    );

    await updateProfilePictureForAllContacts(io, userId, presignedS3Url);

    return res.status(200).json({ fileUrl: presignedS3Url });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return res
      .status(500)
      .json({ error: 'Error uploading profile picture. Please try again.' });
  }
};

const updateUsernameById = async (req, res) => {
  try {
    const io = req.app.get('io');
    const userId = req.user.user_id;
    const username = req.body.username;

    await User.updateUsernameById(username, userId);
    await updateUsernameForAllContacts(io, userId, username);

    return res.status(200).json({ success: 'Username updated successfully' });
  } catch (error) {
    console.error('Error updating username:', error);
    return res
      .status(500)
      .json({ error: 'Error updating username. Please try again.' });
  }
};

// Update a user's list of blocked users
const updateBlockedUsers = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const blockedUserIds = req.body.blockedUserIds;
    await User.updateBlockedUsersById(blockedUserIds, userId);
    return res.status(200).json({ success: 'Block list successfully updated' });
  } catch (error) {
    console.error('Error blocking user:', error);
    return res
      .status(500)
      .json({ error: 'Error blocking user. Please try again.' });
  }
};

// Update profile picture for all the user's contacts in real-time
const updateProfilePictureForAllContacts = async (
  io,
  userId,
  profilePicture
) => {
  const rooms = await PrivateChat.retrieveAllRoomsByUser(userId);
  const roomIds = rooms.map((row) => row.room);

  for (let i = 0; i < roomIds.length; i++) {
    const room = roomIds[i];
    io.to(room).emit('update-profile-picture-for-contacts', {
      userId,
      profilePicture,
      room,
    });
  }
};

// Update username for all the user's contacts in real-time
const updateUsernameForAllContacts = async (io, userId, newUsername) => {
  const rooms = await PrivateChat.retrieveAllRoomsByUser(userId);
  const roomIds = rooms.map((row) => row.room);

  for (let i = 0; i < roomIds.length; i++) {
    const room = roomIds[i];
    io.to(room).emit('update-username-for-contacts', {
      userId,
      newUsername,
      room,
    });
  }
};

export { uploadProfilePicture, updateUsernameById, updateBlockedUsers };
