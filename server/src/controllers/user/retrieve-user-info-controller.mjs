import { User } from '../../models/user-model.mjs';

const retrieveUsernameById = async (req, res) => {
  try {
    const userId = req.session.passport.user;
    const user = await User.getUsernameById(userId);
    res.status(200).json({ username: user.username });
  } catch (error) {
    console.error('Error retrieving username:', error);
    res.status(500).json({ message: 'An unexpected error occurred.' });
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
      return res.status(404).json({ message: error.message });
    }
    console.error('Error retrieving user ID:', error);
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
};

const retrieveUserIdFromSession = async (req, res) => {
  if (req.session.passport && req.session.passport.user) {
    res.json({ userId: req.session.passport.user });
  } else {
    res.json({ message: 'User not authenticated.' });
  }
};

export { retrieveUsernameById, retrieveIdByUsername, retrieveUserIdFromSession };
