export default async function fetchChatList() {
  try {
    const response = await fetch('http://localhost:8080/chats/', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message);
    }

    const data = await response.json();
    return data.chatList;
  } catch (error) {
    throw error;
  }
}
