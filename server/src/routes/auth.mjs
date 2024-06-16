import express from 'express';
import { handleSignUp } from '../controllers/sign-up-controller.mjs';
import { handleUserLogin } from '../controllers/login-controller.mjs';
import { checkAuthStatus } from '../controllers/auth-status-controller.mjs';
import { handleLogout } from '../controllers/logout-controller.mjs';

const authRouter = express.Router();

// Sign up
authRouter.post('/register/password', handleSignUp);

// Login
authRouter.post('/login/password', handleUserLogin);

// Logout
authRouter.post('/logout', handleLogout);

// Retrieve authentication status
authRouter.get('/status', checkAuthStatus);

export default authRouter;
