export const retrieveUserId = async (setUserId, setErrorMessage) => {
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
