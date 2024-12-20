import { getRecipientUserIdByUsername } from './user-api';

// Fetch the chat list of a specific user
async function getChatListByUserId() {
  try {
    const response = await fetch('http://localhost:8080/chats/', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.error);
    }

    const data = await response.json();
    return data.chatList;
  } catch (error) {
    throw error;
  }
}

// Add a chat to the user's chat list
async function addChat(inputUsername, chatList) {
  try {
    // If there is already an active chat with the user, throw an error
    const exists = chatList.some((chat) => chat.name === inputUsername);
    if (exists) {
      throw new Error('You already have an active chat with this user');
    }

    if (!inputUsername) {
      throw new Error('Please enter a username');
    }

    const recipientId = await getRecipientUserIdByUsername(inputUsername);

    if (inputUsername) {
      const response = await fetch('http://localhost:8080/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send the username entered to the backend to ensure that it exists in the database
        body: JSON.stringify({
          recipientName: inputUsername,
          recipientId: recipientId,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error);
      }

      const data = await response.json();
      return data;
    }
  } catch (error) {
    throw error;
  }
}

// Delete a chat in the user's chat list
async function deleteChat(chatId) {
  try {
    const response = await fetch('http://localhost:8080/chats/', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chatId: chatId }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.error);
    }

    const data = await response.json();
    return data.deleteChatStatus;
  } catch (error) {
    throw error;
  }
}

export { getChatListByUserId, addChat, deleteChat };
