import { Request, Response } from 'express';
import { UsernameTakenError } from '../../errors/errors.ts';
import { UserCredentialsSchema } from '../../schemas/user.schema.ts';
import { insertNewUser } from '../../services/auth.service.ts';

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
    const newUser = await insertNewUser(username, password);

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
    if (error instanceof UsernameTakenError) {
      console.error('Error during sign up:', error);
      res.status(409).json({ error: 'Username already taken' });
      return;
    }
    console.error('Error during sign up:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

export { handleSignUp };
