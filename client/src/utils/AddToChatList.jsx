import { fetchRecipientUserId } from './FetchRecipientUserId';

// Add a chat to the user's chat list
export const addChat = async (inputUsername, chatList) => {
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
      const response = await fetch('http://localhost:8080/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send the username entered to the backend to ensure that it exists in the database
        body: JSON.stringify({ username: inputUsername, recipientId: recipientId }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message);
      }

      const data = await response.json();
      return data.newChatItem;
    }
  } catch (error) {
    throw error;
  }
};
