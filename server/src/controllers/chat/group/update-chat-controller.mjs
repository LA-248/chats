import { GroupMember } from '../../../models/group-member-model.mjs';
import { Group } from '../../../models/group-model.mjs';

const addMembers = async (req, res) => {
	try {
		const addedMembers = req.body.addedMembers;
		const room = req.params.room;
		const groupInfo = await Group.retrieveGroupInfoByRoom(room);

		// Add members to the group chat
		const insertGroupMembers = addedMembers.map((user) =>
			GroupMember.insertGroupMember(groupInfo.group_id, user.userId, user.role)
		);
		await Promise.all(insertGroupMembers);

		return res.status(200).json({
			message: 'Members added',
		});
	} catch (error) {
		console.error('Error adding members to group chat:', error);
		return res
			.status(500)
			.json({ error: 'Error adding members. Please try again.' });
	}
};

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

export { addMembers, updateUserReadStatus };
