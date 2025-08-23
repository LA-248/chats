export async function editMessageById(
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

// TODO: Identify resource to be deleted via the URL, not the body (e.g. /chats/:chatId/messages/:messageId)
export async function deleteMessage(
  messageId: number,
  chatId: number
): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_SERVER_BASE_URL}/messages`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messageId, chatId }),
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error);
  }
}
