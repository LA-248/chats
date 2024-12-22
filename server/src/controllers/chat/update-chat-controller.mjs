import { PrivateChat } from '../../models/private-chat-model.mjs';

// Delete a chat from a user's chat list
const deleteChat = async (req, res) => {
  try {
    const userId = req.session.passport.user;
    const room = req.body.room;

    const deleteChatStatus = await PrivateChat.updateChatDeletionStatus(
      userId,
      true,
      room
    );
    return res.status(200).json({ deleteChatStatus: deleteChatStatus });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return res
      .status(500)
      .json({ error: 'Error deleting chat. Please try again.' });
  }
};

export { deleteChat };
