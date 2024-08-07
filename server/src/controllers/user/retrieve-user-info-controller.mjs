import { User } from '../../models/user-model.mjs';

const retrieveUsernameById = async (req, res) => {
  try {
    const userId = req.session.passport.user;
    const user = await User.getUsernameById(userId);
    res.status(200).json({ username: user.username });
  } catch (err) {
    console.error('Error retrieving username:', err);
    res.status(500).json({ error: 'An error occurred while retrieving the username' });
  }
};

const retrieveIdByUsername = async (req, res) => {
  try {
    const username = req.body.username;
    const user = await User.getIdByUsername(username);
    res.status(200).json({ userId: user.id});
  } catch (err) {
    if (err === 'User does not exist. Make sure that the username is correct.') {
      return res.status(404).json({ error: err });
    }
    console.error('Error retrieving user ID:', err);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

const retrieveUserIdFromSession = async (req, res) => {
  if (req.session.passport && req.session.passport.user) {
    res.json({ userId: req.session.passport.user });
  } else {
    res.json({ errorMessage: 'User not authenticated' });
  }
};

export { retrieveUsernameById, retrieveIdByUsername, retrieveUserIdFromSession };
