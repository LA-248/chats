import type { Chat } from '../types/chat';
import type { UserInfo } from '../types/user';
import { getRecipientUserIdByUsername } from './user-api';

// Fetch the chat list of a specific user
async function getChatListByUserId(): Promise<Chat[]> {
  const response = await fetch(
    `${import.meta.env.VITE_SERVER_BASE_URL}/chats/private`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error);
  }

  const data = await response.json();
  return data.chatList;
}

async function getRecipientInfo(
  room: string,
  navigate: (path: string) => void
): Promise<UserInfo> {
  const response = await fetch(
    `${import.meta.env.VITE_SERVER_BASE_URL}/chats/private/${room}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
    }
  );
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
}

// Add a chat to the user's chat list
async function addChat(inputUsername: string): Promise<Chat> {
  const recipientId = await getRecipientUserIdByUsername(inputUsername);

  if (!inputUsername) {
    throw new Error('Username is required');
  }

  const response = await fetch(
    `${import.meta.env.VITE_SERVER_BASE_URL}/chats/private`,
    {
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
    }
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data.addedChat;
}

// Needed for when the most recent message in a chat is deleted
// Ensures the correct latest message is shown in the chat list
async function updateLastMessageId(
  messageId: number | null,
  room: string
): Promise<void> {
  const response = await fetch(
    `${
      import.meta.env.VITE_SERVER_BASE_URL
    }/chats/private/${room}/last_message`,
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
}

async function updateReadStatus(read: boolean, room: string): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_SERVER_BASE_URL}/chats/private/${room}/read_status`,
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
}

// Delete a chat from the user's chat list
async function deletePrivateChat(room: string): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_SERVER_BASE_URL}/chats/private/${room}`,
    {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error);
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
