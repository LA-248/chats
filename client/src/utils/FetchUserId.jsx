const retrieveUserId = async () => {
  try {
    const response = await fetch('http://localhost:8080/users/id', {
      method: 'GET',
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

const initializeUserId = async (setUserId) => {
  try {
    // Fetch the user's ID which is used to display their chat list
    const id = await retrieveUserId();
    setUserId(id);
  } catch (error) {
    console.error(error);
  }
};

export { retrieveUserId, initializeUserId };
