// Retrieve the ID of a message recipient from the database using their username
export const fetchRecipientUserId = async (username) => {
  try {
    const response = await fetch('http://localhost:8080/users/recipient_id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: username }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.error);
    }

    const data = await response.json();
    return data.userId;
  } catch (error) {
    throw error;
  }
};
