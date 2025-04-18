import { Chat } from '../../../models/chat-list-model.mjs';
import { generatePresignedUrlsForChatList } from '../../../services/s3/s3-presigned-url.mjs';

// TODO: Move both of these functions to a different file - this handles all chats, not just private ones

// Fetch the chat list of a specific user
const getChatList = async (req, res) => {
  try {
    const userId = req.user.user_id;
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
    return res.status(500).json({ error: 'Unable to retrieve chat list' });
  }
};

const getChatListByUserId = async (userId) => {
  try {
    const chatList = await Chat.retrieveAllChats(userId);
    await generatePresignedUrlsForChatList(chatList);
    return chatList;
  } catch (error) {
    throw error;
  }
};

export { getChatList, getChatListByUserId };
