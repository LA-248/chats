import { NextFunction, Request, Response } from 'express';
import { UserProfile } from '../../schemas/user.schema.ts';
import passport from 'passport';

export const handleUserLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  passport.authenticate('local', (err: Error, user: UserProfile) => {
    if (!user) {
      res
        .status(401)
        .json({ success: false, error: 'Incorrect username or password' });
      return;
    }

    if (err) {
      res.status(500).json({ success: false, error: 'Internal server error' });
      return;
    }

    req.login(user, (err) => {
      if (err) {
        res.status(500).json({
          success: false,
          error: 'Error logging in. Please try again.',
        });
        return;
      }
      // Redirect URL is included so the frontend can redirect the user after a successful log in
      res.status(200).json({
        success: true,
        message: 'Login successful',
        redirectPath: '/',
      });
    });
  })(req, res, next);
};
