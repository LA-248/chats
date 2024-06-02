import { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';

export default function ProtectedRoutes() {
  const [authenticationStatus, setAuthenticationStatus] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const response = await fetch('http://localhost:8080/auth/status', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      setAuthenticationStatus(data.authenticated);
    };

    checkAuthStatus();
  }, []);

  if (authenticationStatus === null) {
    return <div>Loading...</div>;
  }

  if (authenticationStatus === true) {
    return <Outlet />;
  } else {
    return <Navigate to="/login" />;
  }
}
