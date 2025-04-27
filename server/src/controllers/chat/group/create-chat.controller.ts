import { v4 as uuidv4 } from 'uuid';
import { GroupMember } from '../../../models/group-member.model.ts';
import { Group } from '../../../models/group.model.ts';
import { userSockets } from '../../../handlers/socket-handlers.ts';
import { Request, Response } from 'express';
import { GroupMemberInsertionResult } from '../../../types/group.js';

// TODO: Break up into smaller functions
// Handle creating a group chat
const createGroupChat = async (req: Request, res: Response) => {
  try {
    const io = req.app.get('io');
    const ownerUserId = req.body.loggedInUserId;
    const groupName = req.body.groupName;
    const addedMembers = req.body.addedMembers;
    const room = uuidv4();
    const failedInsertions: GroupMemberInsertionResult[] = [];

    // Handle partial success or full success
    // This ensures that the group is still created even if certain members could not be added
    if (failedInsertions.length > 0) {
      return res.status(207).json({
        message:
          'Group created successfully but some members could not be added',
        failedMembers: failedInsertions,
      });
    }

    return res.status(200).json({
      message: 'Group created',
    });
  } catch (error) {
    console.error('Error creating group chat:', error);
    return res
      .status(500)
      .json({ error: 'Error creating group chat. Please try again.' });
  }
};

const notifyAddedUsers = (io, insertedGroupMembers, newGroupChat) => {
  for (const member of insertedGroupMembers) {
    if (userSockets.has(member.value.user_id)) {
      const socket = userSockets.get(member.value.user_id);
      io.to(socket).emit('add-group-to-chat-list', {
        chat_id: `g_${newGroupChat.group_id}`,
        chat_picture: null,
        chat_type: 'group',
        deleted: false,
        last_message_content:
          member.value.role === 'owner'
            ? `You created ${newGroupChat.name}`
            : 'You were added',
        last_message_id: null,
        last_message_time: null,
        name: newGroupChat.name,
        read: false,
        recipient_user_id: null,
        room: newGroupChat.room,
        updated_at: new Date(),
      });
    }
  }
};

export { createGroupChat };
