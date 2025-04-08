import { Group } from '../../../models/group-model.mjs';

const deleteGroupChat = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const room = req.params.room;

    await Group.deleteChat(userId, room);
    return res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return res
      .status(500)
      .json({ error: 'Error deleting chat. Please try again.' });
  }
};

export { deleteGroupChat };
