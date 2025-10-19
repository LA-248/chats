import express from 'express';
import { handleSignUp } from '../controllers/auth/sign-up.controller.ts';
import { handleUserLogin } from '../controllers/auth/login.controller.ts';
import { handleLogout } from '../controllers/auth/logout.controller.ts';
import { checkAuthStatus } from '../controllers/auth/auth-status.controller.ts';

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
