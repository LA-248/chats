import { GroupMembers } from '../../../models/group-member-model.mjs';
import { Group } from '../../../models/group-model.mjs';
import { v4 as uuidv4 } from 'uuid';

// Handle adding a group chat
const createGroupChat = async (req, res) => {
  try {
    const ownerUserId = req.body.loggedInUserId;
    const groupName = req.body.groupName;
    const room = uuidv4();

    const result = await Group.insertNewGroupChat(ownerUserId, groupName, room);
    await addGroupMember(req, res, result.group_id);

    // Send the updated chat list to the frontend
    return res.status(200).json({ updatedChatList: 'Group created' });
  } catch (error) {
    console.error('Error:', error);
    return res
      .status(500)
      .json({ error: 'Error creating group chat. Please try again.' });
  }
};

const addGroupMember = async (req, res, groupId) => {
  try {
    const userId = req.params.userId;
    const role = req.body.role;

    const result = await GroupMembers.insertGroupMember(groupId, userId, role);
    console.log(result);
  } catch (error) {
    console.error('Error in addGroupMember:', error);
    throw new Error('Failed to add group member');
  }
};

export { createGroupChat, addGroupMember };
