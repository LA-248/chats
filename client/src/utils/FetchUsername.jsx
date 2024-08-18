export default async function fetchUsername() {
  try {
    const response = await fetch('http://localhost:8080/users/username', {
      method: 'GET',
      credentials: 'include',
    });
  
    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message);
    }
  
    const data = await response.json();
    return data.username;
  } catch (error) {
    throw error;
  }
}
