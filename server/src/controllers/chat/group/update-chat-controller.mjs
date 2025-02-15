import { Group } from '../../../models/group-model.mjs';

const updateUserReadStatus = async (req, res) => {
	try {
		const userId = req.user.user_id;
		const room = req.params.room;

		await Group.markUserAsRead(userId, room);
		return res.sendStatus(200);
	} catch (error) {
		console.error('Error adding group member to read list:', error);
		return res.status(500).json({ error: 'An unexpected error occurred' });
	}
};

export { updateUserReadStatus };
