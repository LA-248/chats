import express from 'express';
import passport from 'passport';
import { handleSignUp } from '../controllers/sign-up-controller.mjs';

const authRouter = express.Router();

// Sign up
authRouter.post('/register/password', handleSignUp);

// Login
authRouter.post('/login/password', passport.authenticate('local', {
  successRedirect: 'http://localhost:3000',
  failureRedirect: 'http://localhost:3000/login',
}));

// Logout
authRouter.post('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { 
      res.status(500).json('Error logging out.');
      return;
    }
    res.redirect('http://localhost:3000/login');
    return;
  });
});

export default authRouter;
