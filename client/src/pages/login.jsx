import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css';

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle the submission of the login form
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:8080/auth/login/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error);
      }

      const data = await response.json();
      // If the login was successful, redirect the user to the URL provided by the backend
      navigate(data.redirectPath);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <div>
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">Sign In</div>
          <form className="login-form" onSubmit={handleSubmit}>
            <input
              id="username"
              placeholder="Username"
              name="username"
              type="text"
              autoComplete="username"
              required
              autoFocus
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setErrorMessage('');
              }}
            />
            <input
              id="current-password"
              placeholder="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrorMessage('');
              }}
            />
            <button className="login-button" type="submit">
              Sign in
            </button>
          </form>
          {errorMessage && <div className="error-message" style={{ marginTop: "10px" }}>{errorMessage}</div>}
          <div className="sign-up-redirect">
            Don't have an account? <Link to="/register">Sign up</Link>
          </div>
        </div>
        <div className="logotype">Chats</div>
      </div>
    </div>
  );
}
