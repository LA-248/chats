export default async function deleteChat(chatId) {
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
      throw new Error(errorResponse.message);
    }

    const data = await response.json();
    return data.updatedChatList;
  } catch (error) {
    throw error;
  }
}