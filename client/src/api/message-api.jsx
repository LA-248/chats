async function updateUsernameInMessages(username) {
  try {
    const response = await fetch('http://localhost:8080/messages', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: username }),
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

export { updateUsernameInMessages, deleteMessageById };
