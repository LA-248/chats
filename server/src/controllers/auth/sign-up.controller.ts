import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { User } from '../../repositories/user.repository.ts';
import { UserCredentialsSchema } from '../../schemas/user.schema.ts';

const handleSignUp = async (req: Request, res: Response): Promise<void> => {
  const parsed = UserCredentialsSchema.safeParse(req.body);

  if (!parsed.success) {
    const errorMessages = [];

    for (let i = 0; i < parsed.error.issues.length; i++) {
      errorMessages.push(parsed.error.issues[i].message);
    }

    res.status(400).json({ error: errorMessages.join(', ') });
    return;
  }

  const { username, password } = parsed.data;

  try {
    const userRepository = new User();

    // Check if username already exists
    const existingUser = await userRepository.findUserByUsername(username);
    if (existingUser) {
      res.status(409).json({ error: 'Username already taken' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 14);
    await userRepository.insertUser(username, hashedPassword);
    const newUser = await userRepository.findUserByUsername(username);

    if (!newUser) {
      res.status(500).json({
        error: 'An unexpected error occurred. Please try again.',
      });
      return;
    }

    // Automatically log in the newly created user
    req.login(newUser, (err) => {
      if (err) {
        console.error('Login error:', err);
        res.status(500).json({
          error:
            'Account created successfully, but there was an error logging you in. Please try signing in manually.',
        });
        return;
      }
      res.status(201).json({ redirectPath: '/' });
    });
  } catch (error) {
    console.error('Error during sign up:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

export { handleSignUp };
