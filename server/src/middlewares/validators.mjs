import { body } from 'express-validator';

// Perform validation and sanitization on sign up
export default function validateSignUp() {
	return [
		body('username').notEmpty().withMessage('Username is required').escape(),
		body('password').notEmpty().withMessage('Password is required'),
	];
}
