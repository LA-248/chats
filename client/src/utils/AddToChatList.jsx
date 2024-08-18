import { fetchRecipientUserId } from './FetchRecipientUserId';

// Add a chat to the user's chat list
export const addChat = async (inputUsername, chatList, userId) => {
  try {
    const storedChats = JSON.parse(localStorage.getItem('chat-list'));

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
        const errorResponse = await response.json();
        throw new Error(errorResponse.message);
      }

      // Extract all 'id' values from storedChats into an array
      /*
      This ensures that each chat has a unique ID by getting the largest current ID number and adding 1 when a chat is added,
      this is done because chats are sorted based on message recency and IDs are not organised linearly
      */
      function retrieveAllChatIds() {
        if (storedChats) {
          const getValues = (obj, key) => Object.values(obj).map(item => item[key]);
          const chatIds = getValues(storedChats, 'id');
          return chatIds;
        }
      }
      const allChatIds = retrieveAllChatIds();

      const data = await response.json();
      const lastMessageContent = data.lastMessage;
      const lastMessageTime = data.eventTime;
      const lastMessageTimeWithSeconds = data.eventTimeWithSeconds;
      // Ensure the room is the same for both users by sorting the user IDs
      const room = [userId, recipientId].sort().join('-');

      // Add new chat item with relevant data
      const newChatItem = {
        userId: userId,
        id: chatList.length > 0 ? Math.max(...allChatIds) + 1 : 1,
        name: inputUsername,
        lastMessage: lastMessageContent,
        hasNewMessage: false,
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
