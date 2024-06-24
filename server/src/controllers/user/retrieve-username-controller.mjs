import { getIdByUsername, getUsernameById } from '../../models/user-model.mjs';

const retrieveUsernameById = async (req, res) => {
  try {
    const userId = req.session.passport.user;
    const user = await getUsernameById(userId);
    res.status(200).json({ username: user.username });
  } catch (err) {
    console.error('Error retrieving username:', err);
    res.status(500).json({ error: 'An error occurred while retrieving the username' });
  }
};

const retrieveIdByUsername = async (req, res) => {
  try {
    const username = req.body.username;
    const user = await getIdByUsername(username);
    res.status(200).json({ userId: user.id});
  } catch (err) {
    console.error('Error retrieving user ID:', err);
    res.status(500).json({ error: 'An unexpected error occurred, please try again' });
  }
};

export { retrieveUsernameById, retrieveIdByUsername };
