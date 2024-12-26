import { PrivateChat } from '../../models/private-chat-model.mjs';
import { User } from '../../models/user-model.mjs';
import { getChatListByUserId } from './get-chat-controller.mjs';

// Handle adding a chat (new or previously added but deleted) to a user's chat list
const addChat = async (req, res) => {
  try {
    const { senderId, recipientId, room } = await getChatRoomData(req);
    const chatDeletionStatus = await PrivateChat.retrieveChatDeletionStatus(
      senderId,
      room
    );

    // This check is needed to know whether to insert a new chat in the database and mark it as not deleted or to only do the latter
    // All chats are marked as deleted by default to prevent incorrectly displaying them in a user's chat list
    if (chatDeletionStatus === null) {
      await PrivateChat.insertNewChat(senderId, recipientId, room);
      await PrivateChat.updateChatDeletionStatus(senderId, false, room);
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
