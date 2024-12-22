import { Message } from '../../models/message-model.mjs';
import { PrivateChat } from '../../models/private-chat-model.mjs';
import { User } from '../../models/user-model.mjs';
import { getChatListByUserId } from './get-chat-controller.mjs';

// Handle adding a new chat to a user's chat list
const addChat = async (req, res) => {
  try {
    const { senderId, recipientId, room } = await getChatRoomData(req);
    const chatDeletionStatus = await PrivateChat.retrieveChatDeletionStatus(
      senderId,
      room
    );

    if (chatDeletionStatus.user_deleted === false) {
      await PrivateChat.insertNewChat(
        senderId,
        recipientId,
        room
      );
    } else {
      await PrivateChat.updateChatDeletionStatus(senderId, false, room);
    }

    const updatedChatList = await getChatListByUserId(senderId);

    // Send the updated chat list to the frontend
    return res.status(200).json({ updatedChatList: updatedChatList });
  } catch (error) {
    if (
      error.message ===
      'User does not exist. Make sure that the username is correct.'
    ) {
      return res.status(404).json({ error: error.message });
    }
    console.error('Error:', error);
    return res
      .status(500)
      .json({ error: 'Error adding chat. Please try again.' });
  }
};

const getChatRoomData = async (req) => {
  const username = req.body.recipientName;
  const user = await User.getUserByUsername(username);
  // If there are no rows, the user does not exist
  if (!user) {
    throw new Error(
      'User does not exist. Make sure that the username is correct.'
    );
  }
  const senderId = req.session.passport.user;
  const recipientId = req.body.recipientId;

  // Ensure the room is the same for both users by sorting the user IDs
  const room = [senderId, recipientId].sort().join('-');

  return { senderId, recipientId, room };
};

export { addChat };
