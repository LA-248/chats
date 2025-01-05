import { PrivateChat } from '../../../models/private-chat-model.mjs';
import { generatePresignedUrlsForChatList } from '../../../services/s3/s3-presigned-url.mjs';

// Fetch the chat list of a specific user
const getChatList = async (req, res) => {
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

export { getChatList, getChatListByUserId };
