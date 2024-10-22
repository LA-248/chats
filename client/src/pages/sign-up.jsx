import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/SignUp.css';

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleFormSubmission = async (event) => {
    event.preventDefault();

    try {
      // Validate username and password
      if (username === '' || password === '') {
        throw new Error('Please ensure both fields are filled');
      } else if (username.length < 2 || username.length > 30) {
        throw new Error('Username must be between 2 and 30 characters');
      } else if (password.length < 4 || password.length > 100) {
        throw new Error('Password must be between 4 and 100 characters');
      }

      const response = await fetch(
        'http://localhost:8080/auth/register/password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error);
      }

      const data = await response.json();
      navigate(data.redirectPath);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className='sign-up-container'>
      <div className='sign-up-box'>
        <div className='sign-up-header'>Sign Up</div>
        <div className='sign-up-subtext'>Create an account to get started.</div>
        <form className='sign-up-form' onSubmit={handleFormSubmission}>
          <input
            type='text'
            placeholder='Username'
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              setErrorMessage('');
            }}
          />
          <input
            type='password'
            placeholder='Password'
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrorMessage('');
            }}
          />
          <button className='sign-up-button' type='submit'>
            Sign Up
          </button>
        </form>
        {errorMessage && (
          <div className='error-message' style={{ marginTop: '10px' }}>
            {errorMessage}
          </div>
        )}
        <div className='login-redirect'>
          Already have an account? <Link to='/login'>Log in</Link>
        </div>
      </div>
      <div className='logotype'>Chats</div>
    </div>
  );
}
