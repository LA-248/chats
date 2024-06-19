import { getUsernameById } from '../../models/user-model.mjs';

export const retrieveUsername = async (req, res) => {
  try {
    const userId = req.session.passport.user;
    const user = await getUsernameById(userId);
    res.status(200).json({ username: user.username });
  } catch (err) {
    console.error('Error retrieving username:', err);
    res.status(500).json({ error: 'An error occurred while retrieving the username' });
  }
};
