import { Request, Response } from 'express';

export const checkAuthStatus = (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ authenticated: true });
  } else {
    res.status(200).json({ authenticated: false });
  }
};
