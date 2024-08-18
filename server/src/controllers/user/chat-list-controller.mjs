import { User } from '../../models/user-model.mjs';
import { Message } from '../../models/message-model.mjs';

// Handle adding a new chat to the chat list
export const handleChatList = async (req, res) => {
  try {
    const username = req.body.username;
    const user = await User.getUserByUsername(username);

    // If there are no rows, the user does not exist
    if (!user) {
      throw new Error('User does not exist. Make sure that the username is correct.');
    }

    const senderId = req.session.passport.user;
    const recipientId = req.body.recipientId;

    // Ensure the room is the same for both users by sorting the user IDs
    const room = [senderId, recipientId].sort().join('-');
    
    // Retrieve info related to the last chat message sent in a specific room
    // This is done to keep info related to the most recent message visible in the chat preview when a user deletes and re-adds a chat
    const lastMessage = await Message.retrieveLastMessageInfo(room);

    // Send metadata to frontend to be used when adding a conversation to the chat list
    res.status(200).json({
      recipientId: user.id,
      message: `Added ${username} to chat list`,
      lastMessage: lastMessage.content,
      eventTime: lastMessage.event_time,
      eventTimeWithSeconds: lastMessage.event_time_seconds,
    });
  } catch (error) {
    if (error.message === 'User does not exist. Make sure that the username is correct.') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Error:', error);
    res.status(500).json({ message: 'Error adding chat. Please try again.' });
  }
};
