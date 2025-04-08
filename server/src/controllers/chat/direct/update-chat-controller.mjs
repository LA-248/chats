import { PrivateChat } from '../../../models/private-chat-model.mjs';

// Update the last message id for a chat, used when last message is deleted
const updateLastMessageId = async (req, res) => {
  try {
    const newLastMessageId = req.body.messageId;
    const room = req.params.room;

    await PrivateChat.updateLastMessage(newLastMessageId, room);
    return res
      .status(200)
      .json({ success: 'Last message successfully updated' });
  } catch (error) {
    console.error('Error updating last message id:', error);
    return res.status(500).json({
      error:
        'There was an error updating your chat list. Please refresh the page.',
    });
  }
};

const updateChatReadStatus = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const read = req.body.read;
    const room = req.params.room;

    await PrivateChat.updateUserReadStatus(userId, read, room);
    return res
      .status(200)
      .json({ success: 'Read status updated successfully.' });
  } catch (error) {
    console.error('Error updating read status:', error);
    return res.status(500).json({
      error:
        'There was an error updating the read status of your chat. Please refresh the page.',
    });
  }
};

// Delete a chat from a user's chat list
const deleteChat = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const room = req.params.room;

    await PrivateChat.updateChatDeletionStatus(userId, true, room);
    return res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return res
      .status(500)
      .json({ error: 'Error deleting chat. Please try again.' });
  }
};

export { updateLastMessageId, updateChatReadStatus, deleteChat };
