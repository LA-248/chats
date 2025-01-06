import { GroupMembers } from '../../../models/group-member-model.mjs';
import { Group } from '../../../models/group-model.mjs';
import { v4 as uuidv4 } from 'uuid';

// Handle adding a group chat
const createGroupChat = async (req, res) => {
  try {
    const ownerUserId = req.body.loggedInUserId;
    const groupName = req.body.groupName;
    const addedMembersUserIds = req.body.addedMembersUserIds;
    const room = uuidv4();

    const result = await Group.insertNewGroupChat(ownerUserId, groupName, room);
    for (let i = 0; i < addedMembersUserIds.length; i++) {
      await GroupMembers.insertGroupMember(
        result.group_id,
        addedMembersUserIds[i],
        'member'
      );
    }

    // Send the updated chat list to the frontend
    return res.status(200).json({ updatedChatList: 'Group created' });
  } catch (error) {
    console.error('Error:', error);
    return res
      .status(500)
      .json({ error: 'Error creating group chat. Please try again.' });
  }
};

export { createGroupChat };
