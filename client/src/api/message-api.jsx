async function deleteMessageById(messageId) {
  try {
    const response = await fetch('http://localhost:8080/messages', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messageId: messageId }),
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

export { deleteMessageById };
