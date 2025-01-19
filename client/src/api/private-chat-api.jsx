import { getRecipientUserIdByUsername } from './user-api';

// Fetch the chat list of a specific user
async function getChatListByUserId() {
  try {
    const response = await fetch('http://localhost:8080/chats', {
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

async function getRecipientInfo(room, navigate) {
  try {
    const response = await fetch(
      `http://localhost:8080/chats/${room}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );
    const data = await response.json();

    // Redirect user to homepage if they try to access a chat via the URL with a user that does not exist
    if (response.status === 302) {
      navigate(data.redirectPath);
    }
    if (!response.ok) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Add a chat to the user's chat list
async function addChat(inputUsername, chatList) {
  try {
    const exists = chatList.some(
      (chat) =>
        chat.recipient_username === inputUsername && chat.user_deleted === false
    );
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

// Needed for when the most recent message in a chat is deleted
// Ensures the correct latest message is shown in the chat list
async function updateLastMessageId(messageId, room) {
  try {
    const response = await fetch('http://localhost:8080/chats', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messageId: messageId, room: room }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.error);
    }
  } catch (error) {
    throw error;
  }
}

async function updateReadStatus(read, room) {
  try {
    const response = await fetch(
      `http://localhost:8080/chats/${room}/read_status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: read }),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.error);
    }
  } catch (error) {
    throw error;
  }
}

// Delete a chat from the user's chat list
async function deleteChat(room) {
  try {
    const response = await fetch('http://localhost:8080/chats', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ room: room }),
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

export {
  getChatListByUserId,
  getRecipientInfo,
  addChat,
  updateLastMessageId,
  updateReadStatus,
  deleteChat,
};
