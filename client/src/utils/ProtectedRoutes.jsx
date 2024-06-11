import { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';

export default function ProtectedRoutes() {
  const [authenticationStatus, setAuthenticationStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const checkAuthStatus = async () => {
        const response = await fetch('http://localhost:8080/auth/status', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('There was an error retrieving the authentication status.');
        }

        const data = await response.json();
        setAuthenticationStatus(data.authenticated);
      };
  
      checkAuthStatus();
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  if (authenticationStatus === null) {
    return <div>Loading...</div>;
  }

  if (authenticationStatus === true) {
    return <Outlet />;
  } else {
    return <Navigate to="/login" />;
  }
}
