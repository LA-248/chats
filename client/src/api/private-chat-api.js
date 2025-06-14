import { getRecipientUserIdByUsername } from './user-api';

// Fetch the chat list of a specific user
async function getChatListByUserId() {
  try {
    const response = await fetch('http://localhost:8080/chats', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
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
    const response = await fetch(`http://localhost:8080/chats/${room}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
    });
    const data = await response.json();

    // Redirect user to homepage if they try to access a chat via the URL with a user that does not exist
    // or they try to access a room that they are not a part of
    if (
      response.status === 403 ||
      response.status === 404 ||
      response.status === 500
    ) {
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
async function addChat(inputUsername) {
  try {
    const recipientId = await getRecipientUserIdByUsername(inputUsername);

    if (inputUsername) {
      const response = await fetch('http://localhost:8080/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        // Send the username entered to the backend to ensure that it exists in the database
        body: JSON.stringify({
          recipientName: inputUsername,
          recipientId: recipientId,
        }),
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      return data.addedChat;
    }
  } catch (error) {
    throw error;
  }
}

// Needed for when the most recent message in a chat is deleted
// Ensures the correct latest message is shown in the chat list
async function updateLastMessageId(messageId, room) {
  try {
    const response = await fetch(
      `http://localhost:8080/chats/${room}/last_message`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId: messageId }),
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

async function updateReadStatus(read, room) {
  try {
    const response = await fetch(
      `http://localhost:8080/chats/${room}/read_status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read }),
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
async function deletePrivateChat(room) {
  try {
    const response = await fetch(`http://localhost:8080/chats/${room}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
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

export {
  getChatListByUserId,
  getRecipientInfo,
  addChat,
  updateLastMessageId,
  updateReadStatus,
  deletePrivateChat,
};
