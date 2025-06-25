async function editMessageById(
  newMessage: string,
  messageId: number | null
): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_SERVER_BASE_URL}/messages`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newMessage: newMessage, messageId: messageId }),
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error);
  }
}

async function deleteMessageById(messageId: number | null): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_SERVER_BASE_URL}/messages`,
    {
      method: 'DELETE',
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

export { editMessageById, deleteMessageById };
