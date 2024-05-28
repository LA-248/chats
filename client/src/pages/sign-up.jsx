import { Link } from 'react-router-dom';
import '../styles/SignUp.css';

export default function SignUp() {
  return (
    <div className="sign-up-container">
      <div className="sign-up-box">
        <div className="sign-up-header">Sign Up</div>
        <div className="sign-up-subtext">Create an account to get started.</div>
        <form className="sign-up-form" action="http://localhost:8080/auth/register/password" method="post">
          <input type="text" name="username" placeholder="Username" />
          <input type="password" name="password" placeholder="Password" />
          <button className="sign-up-button" type="submit">
            Sign Up
          </button>
        </form>
        <div className="login-redirect">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
