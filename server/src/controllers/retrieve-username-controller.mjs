import { getUserById } from '../models/user-model.mjs';

export const retrieveUsername = async (req, res) => {
  try {
    const userId = req.session.passport.user;
    const row = await getUserById(userId);
    res.status(200).json({ username: row.username });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};
