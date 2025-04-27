import { Request, Response } from 'express';

export const checkAuthStatus = (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({ authenticated: true });
  } else {
    return res.status(200).json({ authenticated: false });
  }
};
