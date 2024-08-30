import { Chat } from '../models/chat-model.mjs';

// Automatically add a chat to the recipient's chat list when a message is received if it doesn't already exist
export default async function addChatForRecipientOnMessageReceive(recipientId, username, message, hasNewMessage, currentTime, currentTimeWithSeconds, senderId, roomName) {
  const recipientChatList = await Chat.retrieveChatListByUserId(recipientId);

  // Filter recipient's chat list to find existing chats with the sender
  const existingChatsWithSender = [];
  for (let i = 0; i < recipientChatList.length; i++) {
    if (recipientChatList[i].recipient_id === senderId) {
      existingChatsWithSender.push(recipientChatList[i]);
    }
  }

  // If the array length is 0, the chat does not exist, add it to the recipient's list
  if (existingChatsWithSender.length === 0) {
    await Chat.insertNewChat(recipientId, username, message, hasNewMessage, currentTime, currentTimeWithSeconds, senderId, roomName);
  };
}
