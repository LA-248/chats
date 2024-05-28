import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8080/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(await response.json());
      }

      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <button className="logout-button" onClick={handleLogout}>
      Logout
    </button>
  );
}
