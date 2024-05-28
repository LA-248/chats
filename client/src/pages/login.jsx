import { Link } from 'react-router-dom';
import '../styles/Login.css';

export default function Login() {
  return (
    <div>
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">Sign In</div>
          <form className="login-form" action="http://localhost:8080/auth/login/password" method="post">
            <input
              id="username"
              placeholder="Username"
              name="username"
              type="text"
              autoComplete="username"
              required
              autoFocus
            />
            <input
              id="current-password"
              placeholder="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
            <button className="login-button" type="submit">
              Sign in
            </button>
          </form>
          <div className="sign-up-redirect">
            Don't have an account? <Link to="/register">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
