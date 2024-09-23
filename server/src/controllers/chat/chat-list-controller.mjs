import { User } from '../../models/user-model.mjs';
import { Message } from '../../models/message-model.mjs';
import { Chat } from '../../models/chat-model.mjs';
import { retrieveCurrentTimeWithSeconds } from '../../utils/time-utils.mjs';
import { createPresignedUrl } from '../../services/s3-file-handler.mjs';
import NodeCache from 'node-cache';
const profilePictureUrlCache = new NodeCache({ stdTTL: 604800 });

// Handle adding a new chat to a user's chat list
const addChat = async (req, res) => {
  try {
    const username = req.body.chatName;
    const user = await User.getUserByUsername(username);

    // If there are no rows, the user does not exist
    if (!user) {
      throw new Error('User does not exist. Make sure that the username is correct.');
    }

    const senderId = req.session.passport.user;
    const recipientId = req.body.recipientId;
    const recipientProfilePicture = await User.getUserProfilePicture(recipientId);
    const currentTimeWithSeconds = retrieveCurrentTimeWithSeconds();

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
    // Use the timestamp with seconds to set a newly added chat to the top of the chat list
    const timestampWithSeconds = lastMessageData ? lastMessageData.event_time_seconds : currentTimeWithSeconds;

    // Insert new chat data into database
    const newChatItem = await Chat.insertNewChat(userId, name, content, hasNewMessage, timestamp, timestampWithSeconds, recipientId, recipientProfilePicture, room);
    console.log(newChatItem);

    // Send the new chat's data to the frontend so it can be added it to the UI
    return res.status(200).json({ newChatItem: newChatItem });
  } catch (error) {
    if (error.message === 'User does not exist. Make sure that the username is correct.') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Error:', error);
    return res.status(500).json({ error: 'Error adding chat. Please try again.' });
  }
};

// Fetch the chat list of a specific user
const retrieveChatList = async (req, res) => {
  try {
    const userId = req.session.passport.user;
    const chatList = await Chat.retrieveChatListByUserId(userId);

    // For each chat in the chat list, generate a presigned S3 url using the recipient's profile picture file name
    // This url is required to display the recipient's profile picture in the chat list UI
    for (let i = 0; i < chatList.length; i++) {
      if (!(chatList[i].recipient_profile_picture === null)) {
        const profilePictureFileName = chatList[i].recipient_profile_picture;
        let presignedS3Url = profilePictureUrlCache.get(profilePictureFileName);
  
        // If presigned url is not in cache, generate a new one
        if (!presignedS3Url) {
          presignedS3Url = await createPresignedUrl(process.env.BUCKET_NAME, profilePictureFileName);
          profilePictureUrlCache.set(profilePictureFileName, presignedS3Url);
        }
  
        chatList[i].recipient_profile_picture = presignedS3Url;
      }
    }

    // Send user's chat list data to the frontend so it can be displayed in the UI
    return res.status(200).json({ chatList: chatList });
  } catch (error) {
    if (error.message === 'Error retrieving profile pictures') {
      return res.status(500).json({ error: 'Unable to retrieve profile picture(s)' });
    }
    console.error('Error retrieving chat list:', error);
    return res.status(500).json({ error: 'Unable to retrieve chat list.' });
  }
};

// Delete a chat from a user's chat list
const deleteChat = async (req, res) => {
  try {
    const userId = req.session.passport.user;
    const chatId = req.body.chatId;

    const updatedChatList = await Chat.deleteChatByUserId(userId, chatId);
    return res.status(200).json({ updatedChatList: updatedChatList });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return res.status(500).json({ error: 'Error deleting chat. Please try again.' });
  }
};

// Update a chat in the chat with the latest message data
const updateChatInChatList = async (req, res) => {
  try {
    const lastMessage = req.body.lastMessage;
    const timestamp = req.body.timestamp;
    const timestampWithSeconds = req.body.timestampWithSeconds;
    const room = req.body.room;

    const updatedChatList = await Chat.updateChatInChatList(lastMessage, timestamp, timestampWithSeconds, room);
    return res.status(200).json({ updatedChatList: updatedChatList });
  } catch (error) {
    console.error('Error updating chat:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

// Update the name of a chat - used for when a recipient changes their username
const updateChatName = async (req, res) => {
  try {
    const newUsername = req.body.newUsername;
    const userId = req.session.passport.user;
    await Chat.updateChatName(newUsername, userId);
    res.status(200).json({ success: 'Chat list updated successfully'});
  } catch (error) {
    console.error('Error updating chat name:', error);
    return res.status(500).json({ error: 'An unexpected error occurred'});
  }
};

export { addChat, retrieveChatList, deleteChat, updateChatInChatList, updateChatName };
