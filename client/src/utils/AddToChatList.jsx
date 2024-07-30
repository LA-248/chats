import { fetchRecipientUserId } from './FetchRecipientUserId';

// Add a chat to the user's chat list
export const addChat = async (inputUsername, chatList, userId) => {
  try {
    // If there is already an active chat with the user, throw an error
    const exists = chatList.some((chat) => chat.name === inputUsername);
    if (exists) {
      throw new Error('You already have an active chat with this user');
    }

    if (!inputUsername) {
      throw new Error('Please enter a username');
    }

    const recipientId = await fetchRecipientUserId(inputUsername);

    if (inputUsername) {
      const response = await fetch('http://localhost:8080/users/chat_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send the username entered to the backend to ensure that it exists in the database
        body: JSON.stringify({ username: inputUsername, recipientId: recipientId }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errorMessage);
      }

      const data = await response.json();
      const lastMessageContent = data.lastMessage;
      const lastMessageTime = data.eventTime;
      const lastMessageTimeWithSeconds = data.eventTimeWithSeconds;
      // Ensure the room is the same for both users by sorting the user IDs
      const room = [userId, recipientId].sort().join('-');

      // Add new chat item with relevant data
      const newChatItem = {
        userId: userId,
        id: chatList.length > 0 ? chatList[chatList.length - 1].id + 1 : 1,
        name: inputUsername,
        lastMessage: lastMessageContent,
        time: lastMessageTime,
        timeWithSeconds: lastMessageTimeWithSeconds,
        recipientId: recipientId,
        room: room,
      };

      return newChatItem;
    }
  } catch (error) {
    throw error;
  }
};
