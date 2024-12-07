import { User } from '../../models/user-model.mjs';
import { Message } from '../../models/message-model.mjs';
import { PrivateChat } from '../../models/private-chat-model.mjs';
import { createPresignedUrl } from '../../services/s3-file-handler.mjs';
import NodeCache from 'node-cache';
const profilePictureUrlCache = new NodeCache({ stdTTL: 604800 });

// Handle adding a new chat to a user's chat list
const addChat = async (req, res) => {
  try {
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

    // Retrieve info related to the last chat message sent in a specific room
    // This is done to keep info related to the most recent message visible in the chat preview when a user deletes and re-adds a chat
    const lastMessageData = await Message.retrieveLastMessageInfo(room);
    console.log(lastMessageData);

    await PrivateChat.insertNewChat(senderId, recipientId, lastMessageData, room);
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

// Fetch the chat list of a specific user
const retrieveChatList = async (req, res) => {
  try {
    const userId = req.session.passport.user;
    const chatList = await getChatListByUserId(userId);

    // Send user's chat list data to the frontend so it can be displayed in the UI
    return res.status(200).json({ chatList: chatList });
  } catch (error) {
    if (error.message === 'Error retrieving profile pictures') {
      return res
        .status(500)
        .json({ error: 'Unable to retrieve profile picture(s)' });
    }
    console.error('Error retrieving chat list:', error);
    return res.status(500).json({ error: 'Unable to retrieve chat list.' });
  }
};

const getChatListByUserId = async (userId) => {
  const chatList = await PrivateChat.retrieveChatListByUserId(userId);
  await generatePresignedUrlsForChatList(chatList);
  return chatList;
};

const generatePresignedUrlsForChatList = async (chatList) => {
  // For each chat in the chat list, generate a presigned S3 url using the recipient's profile picture file name
  // This url is required to display the recipient's profile picture in the chat list UI
  for (let i = 0; i < chatList.length; i++) {
    // Only run this code if the user has uploaded a profile picture
    if (chatList[i].recipient_profile_picture !== null) {
      const profilePictureFileName = chatList[i].recipient_profile_picture;
      let presignedS3Url = profilePictureUrlCache.get(profilePictureFileName);

      // If presigned url is not in cache, generate a new one
      if (!presignedS3Url) {
        presignedS3Url = await createPresignedUrl(
          process.env.BUCKET_NAME,
          profilePictureFileName
        );
        profilePictureUrlCache.set(profilePictureFileName, presignedS3Url);
      }

      chatList[i].recipient_profile_picture = presignedS3Url;
    }
  }
};

// Delete a chat from a user's chat list
const deleteChat = async (req, res) => {
  try {
    const userId = req.session.passport.user;
    const chatId = req.body.chatId;

    const deleteChatStatus = await PrivateChat.deleteChatByUserId(
      userId,
      chatId
    );
    return res.status(200).json({ deleteChatStatus: deleteChatStatus });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return res
      .status(500)
      .json({ error: 'Error deleting chat. Please try again.' });
  }
};

export { addChat, retrieveChatList, deleteChat };
