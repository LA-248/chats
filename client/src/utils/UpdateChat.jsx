export default async function updateChat(message, timestamp, timestampWithSeconds, hasNewMessage, room) {
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
        hasNewMessage: hasNewMessage,
        room: room,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message);
    }

    const data = await response.json();
    return data.updatedChatList;
  } catch (error) {
    throw error;
  }
}
