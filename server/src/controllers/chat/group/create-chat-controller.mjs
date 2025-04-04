import { GroupMember } from '../../../models/group-member-model.mjs';
import { Group } from '../../../models/group-model.mjs';
import { v4 as uuidv4 } from 'uuid';
import { getChatListByUserId } from '../direct/get-chat-controller.mjs';

// TODO: Break up into smaller functions
// Handle creating a group chat
const createGroupChat = async (req, res) => {
	try {
		const ownerUserId = req.body.loggedInUserId;
		const groupName = req.body.groupName;
		const addedMembers = req.body.addedMembers;
		const room = uuidv4();

		const result = await Group.insertNewGroupChat(ownerUserId, groupName, room);

		// Add members to the group chat concurrently
		const insertGroupMembers = addedMembers.map((user) =>
			GroupMember.insertGroupMember(result.group_id, user.userId, user.role)
		);
		const results = await Promise.allSettled(insertGroupMembers);

		// Log failed insertions
		const failedInsertions = [];
		for (let i = 0; i < results.length; i++) {
			if (results[i].status === 'rejected') {
				console.error(
					`Failed to add user ${addedMembersUserIds[i]}:`,
					result.reason
				);
				failedInsertions.push(addedMembersUserIds[i]);
			}
		}

		// Handle partial success or full success
		// This ensures that the group is still created even if certain members could not be added
		if (failedInsertions.length > 0) {
			return res.status(207).json({
				message:
					'Group created successfully but some members could not be added',
				failedMembers: failedInsertions,
			});
		}

		// TODO: Find a more optimised way to update the chat list with the created group chat,
		// rather than retrieving the whole chat list each time
		const updatedChatList = await getChatListByUserId(ownerUserId);

		return res.status(200).json({
			message: 'Group created',
			updatedChatList: updatedChatList,
		});
	} catch (error) {
		console.error('Error creating group chat:', error);
		return res
			.status(500)
			.json({ error: 'Error creating group chat. Please try again.' });
	}
};

export { createGroupChat };
