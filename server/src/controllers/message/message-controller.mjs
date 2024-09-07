import { Message } from '../../models/message-model.mjs';

const deleteMessageById = async (req, res) => {
  try {
    const messageId = req.body.messageId;
    const deletedMessage = await Message.deleteMessageById(messageId);
    console.log(deletedMessage.content);
    res.status(200).json({ success: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Error deleting message. Please try again.' });
  }
};

export { deleteMessageById };
