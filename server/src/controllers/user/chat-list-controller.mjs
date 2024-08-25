import { User } from '../../models/user-model.mjs';
import { Message } from '../../models/message-model.mjs';
import { Chat } from '../../models/chat-model.mjs';

// Handle adding a new chat to a user's chat list
const addChat = async (req, res) => {
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
    const lastMessageData = await Message.retrieveLastMessageInfo(room);

    const userId = senderId;
    const name = username;
    const content = lastMessageData ? lastMessageData.content : '';
    const hasNewMessage = false;
    const timestamp = lastMessageData ? lastMessageData.event_time : '';
    const timestampWithSeconds = lastMessageData ? lastMessageData.event_time_seconds : '';

    // Insert new chat data into database
    const newChatItem = await Chat.insertNewChat(userId, name, content, hasNewMessage, timestamp, timestampWithSeconds, recipientId, room);
    console.log(newChatItem);

    // Send the new chat's data to the frontend so it can be added it to the UI
    return res.status(200).json({ newChatItem: newChatItem });
  } catch (error) {
    if (error.message === 'User does not exist. Make sure that the username is correct.') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Error:', error);
    return res.status(500).json({ message: 'Error adding chat. Please try again.' });
  }
};

// Fetch the chat list of a specific user
const retrieveChatList = async (req, res) => {
  try {
    const userId = req.session.passport.user;
    const chatList = await Chat.retrieveChatListByUserId(userId);
    // Send user's chat list data to the frontend so it can be displayed in the UI
    return res.status(200).json({ chatList: chatList });
  } catch (error) {
    console.error('Error retrieving chat list:', error);
    return res.status(500).json({ message: 'Unable to retrieve chat list.' });
  }
}

// Delete a chat from a user's chat list
const deleteChat = async (req, res) => {
  try {
    const userId = req.session.passport.user;
    const chatId = req.body.chatId;
    console.log(chatId);

    const updatedChatList = await Chat.deleteChatByUserId(userId, chatId);
    return res.status(200).json({ updatedChatList: updatedChatList });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return res.status(500).json({ message: 'Error deleting chat. Please try again.' });
  }
}

const updateChatInChatList = async (req, res) => {
  try {
    const lastMessage = req.body.lastMessage;
    const timestamp = req.body.timestamp;
    const timestampWithSeconds = req.body.timestampWithSeconds;
    const room = req.body.room;

    const updatedChatList = await Chat.updateChatInChatList(lastMessage, timestamp, timestampWithSeconds, room);
    console.log(updatedChatList);
    return res.status(200).json({ updatedChatList: updatedChatList });
  } catch (error) {
    console.error('Error updating chat:', error);
    return res.status(500).json({ message: 'An unexpected error occurred.' });
  }
}

export { addChat, retrieveChatList, deleteChat, updateChatInChatList };
