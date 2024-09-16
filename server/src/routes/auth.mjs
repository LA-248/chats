import express from 'express';
import validateSignUp from '../middlewares/validators.mjs';
import { handleSignUp } from '../controllers/auth/sign-up-controller.mjs';
import { handleUserLogin } from '../controllers/auth/login-controller.mjs';
import { checkAuthStatus } from '../controllers/auth/auth-status-controller.mjs';
import { handleLogout } from '../controllers/auth/logout-controller.mjs';

const authRouter = express.Router();

// Sign up
authRouter.post('/register/password', validateSignUp(), handleSignUp);

// Login
authRouter.post('/login/password', handleUserLogin);

// Logout
authRouter.post('/logout', handleLogout);

// Retrieve authentication status
authRouter.get('/status', checkAuthStatus);

export default authRouter;
