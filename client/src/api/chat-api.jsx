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

    /*
    // Get the ID for each user added to the group
    let recipientIds = [];
    for (let i = 0; i < addedMembers.length; i++) {
      const addedMember = addedMembers[i];
      const recipientId = await getRecipientUserIdByUsername(addedMember);
      recipientIds.push(recipientId);
    }
    */

    const recipientId = await getRecipientUserIdByUsername(inputUsername);

    if (inputUsername) {
      const response = await fetch('http://localhost:8080/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send the username entered to the backend to ensure that it exists in the database
        body: JSON.stringify({
          chatName: inputUsername,
          recipientId: recipientId,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error);
      }

      const data = await response.json();
      return data.newChatItem;
    }
  } catch (error) {
    throw error;
  }
}

// Update a chat in the user's chat list
async function updateChatList(message, timestamp, timestampWithSeconds, room) {
  try {
    const response = await fetch('http://localhost:8080/chats/', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lastMessage: message,
        timestamp: timestamp,
        timestampWithSeconds: timestampWithSeconds,
        room: room,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.error);
    }

    const data = await response.json();
    return data.updatedChatList;
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
    return data.updatedChatList;
  } catch (error) {
    throw error;
  }
}

export { getChatListByUserId, addChat, updateChatList, deleteChat };
