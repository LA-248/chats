import express from 'express';
import passport from 'passport';
import { handleSignUp } from '../controllers/sign-up-controller.mjs';
import { checkAuthStatus } from '../controllers/auth-status-controller.mjs';

const authRouter = express.Router();

// Sign up
authRouter.post('/register/password', handleSignUp);

// Login
authRouter.post('/login/password', (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Login failed' });
      }
      // Redirect URL is included so the frontend can redirect the user after a successful log in
      return res.status(200).json({ success: true, message: 'Login successful', redirectPath: '/' });
    });
  })(req, res, next)
});

// Logout
authRouter.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      res.status(500).json('Error logging out.');
      return;
    }

    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        res.status(500).json('Error destroying session.');
        return;
      }

      res.clearCookie('connect.sid');
      console.log('Session destroyed');
      res.status(200).json('Logout successful');
      return;
    });
  });
});

// Retrieve authentication status
authRouter.get('/status', checkAuthStatus);

export default authRouter;
