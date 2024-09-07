import { User } from '../../models/user-model.mjs';

const updateBlockedUsers = async (req, res) => {
  try {
    const userId = req.session.passport.user;
    const blockedUserIds = req.body.blockedUserIds;
    await User.updateBlockedUsersById(blockedUserIds, userId);
    res.status(200).json({ error: 'Block list successfully updated' });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: 'Error blocking user. Please try again.' });
  }
};

export { updateBlockedUsers };
