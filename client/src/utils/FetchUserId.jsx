export const retrieveUserId = async () => {
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
  } catch (err) {
    throw new Error(err.message);
  }
};
