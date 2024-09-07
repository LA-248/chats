import { Message } from '../../models/message-model.mjs';

const deleteMessageById = async (req, res) => {
  try {
    const messageId = req.body.messageId;
    await Message.deleteMessageById(messageId);
    res.status(200).json({ success: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Error deleting message. Please try again.' });
  }
};

export { deleteMessageById };
