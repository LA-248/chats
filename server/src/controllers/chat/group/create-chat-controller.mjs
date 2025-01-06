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

    // Add members to the group chat concurrently
    const insertPromises = addedMembersUserIds.map((userId) =>
      GroupMembers.insertGroupMember(result.group_id, userId, 'member')
    );

    const results = await Promise.allSettled(insertPromises);

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
    if (failedInsertions.length > 0) {
      console.warn('Some members could not be added:', failedInsertions);
      return res.status(207).json({
        message:
          'Group created successfully but some members could not be added',
        failedMembers: failedInsertions,
      });
    }
    return res.status(200).json({ success: 'Group created successfully' });
  } catch (error) {
    console.error('Error:', error);
    return res
      .status(500)
      .json({ error: 'Error creating group chat. Please try again.' });
  }
};

export { createGroupChat };
