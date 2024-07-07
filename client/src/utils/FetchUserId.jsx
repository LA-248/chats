const retrieveUserId = async () => {
  try {
    const response = await fetch('http://localhost:8080/users/id', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve user ID');
    }

    const data = await response.json();
    return data.userId;
  } catch (error) {
    throw error.message;
  }
};

const initializeUserId = async (setUserId) => {
  try {
    // Fetch the user's ID which is used to display their chat list
    const id = await retrieveUserId();
    setUserId(id);
  } catch (err) {
    console.error(err.message);
  }
};

export { retrieveUserId, initializeUserId };
