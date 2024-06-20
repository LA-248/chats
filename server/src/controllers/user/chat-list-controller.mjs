import { getUserByUsername } from '../../models/user-model.mjs';

export const handleChatList = async (req, res) => {
  try {
    const username = req.body.username;
    await getUserByUsername(username);
    console.log(`Added ${username} to chat list`);
    res.status(200).json({ message: `Added ${username} to chat list` });
  } catch (err) {
    console.error('Error:', err);
    res.status(404).json({ errorMessage: err });
  }
};
