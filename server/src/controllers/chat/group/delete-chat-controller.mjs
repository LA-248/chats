import { GroupMember } from '../../../models/group-member-model.mjs';
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

// Used when a user voluntarily leaves a group chat
const removeGroupMember = async (req, res) => {
	try {
		const groupId = req.params.groupId;
		const userId = req.params.userId;

		await GroupMember.removeGroupMember(groupId, userId);
		return res
			.status(200)
			.json({ message: 'You successfully left the group chat' });
	} catch (error) {
		console.error('Error leaving group chat:', error);
		return res
			.status(500)
			.json({ error: 'Error leaving group chat. Please try again.' });
	}
};

export { deleteGroupChat, removeGroupMember };
