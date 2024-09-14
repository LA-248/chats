import { User } from '../../models/user-model.mjs';

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
}

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

export { updateUsernameById, updateBlockedUsers };
