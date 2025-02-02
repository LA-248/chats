import { Message } from '../../models/message-model.mjs';

const editMessageById = async (req, res) => {
	try {
		const newMessage = req.body.newMessage;
		const messageId = req.body.messageId;
		await Message.editMessageContent(newMessage, messageId);
		res.status(200).json({ editedMessage: newMessage });
	} catch (error) {
		console.error('Error editing message:', error);
		res.status(500).json({ error: 'Error editing message. Please try again.' });
	}
};

const deleteMessageById = async (req, res) => {
	try {
		const messageId = req.body.messageId;
		await Message.deleteMessageById(messageId);
		res.status(200).json({ success: 'Message deleted successfully' });
	} catch (error) {
		console.error('Error deleting message:', error);
		res
			.status(500)
			.json({ error: 'Error deleting message. Please try again.' });
	}
};

export { editMessageById, deleteMessageById };
