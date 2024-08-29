export default async function fetchUserData() {
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
