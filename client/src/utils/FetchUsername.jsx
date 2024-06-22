export default async function fetchUsername() {
  try {
    const response = await fetch('http://localhost:8080/users/username', {
      method: 'GET',
      credentials: 'include',
    });
  
    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.error);
    }
  
    const data = await response.json();
    return data.username;
  } catch (error) {
    return console.error('Error fetching user data:', error.message);
  }
}
