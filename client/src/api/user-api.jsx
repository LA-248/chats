async function getUserData() {
  try {
    const response = await fetch('http://localhost:8080/users/', {
      method: 'GET',
      credentials: 'include',
    });
  
    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message);
    }
  
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

async function getUserId(setUserId, setErrorMessage) {
  try {
    const response = await fetch('http://localhost:8080/users/id', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message);
    }

    const data = await response.json();
    setUserId(data.userId);
  } catch (error) {
    setErrorMessage(error.message);
  }
};

// Retrieve the ID of a message recipient from the database using their username
async function getRecipientUserId(username) {
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
      const errorResponse = await response.json();
      throw new Error(errorResponse.message);
    }

    const data = await response.json();
    return data.userId;
  } catch (error) {
    throw error;
  }
};

export { getUserData, getUserId, getRecipientUserId };
