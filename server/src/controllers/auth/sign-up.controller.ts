import bcrypt from 'bcrypt';
import { User } from '../../models/user.model.ts';
import { validationResult } from 'express-validator';
import { Request, Response } from 'express';

const handleSignUp = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Send validation errors to the client
    return res.status(400).send({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    // Check if username already exists
    const existingUser = await User.getUserByUsername(username);

    if (existingUser) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    // Hash user password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await User.insertNewUser(username, hashedPassword);

    // Fetch the newly created user
    const newUser = await User.getUserByUsername(username);

    // Automatically log in the newly created user
    req.login(newUser, (err) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({
          error:
            'Account created successfully, but there was an error logging you in. Please try signing in manually.',
        });
      }
      return res.status(200).json({ redirectPath: '/' });
    });
  } catch (error) {
    console.error('Error during sign up:', error);
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

export { handleSignUp };
