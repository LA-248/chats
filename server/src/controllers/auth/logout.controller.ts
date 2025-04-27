import { Request, Response } from "express";

export const handleLogout = (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      res.status(500).json('Error logging out.');
      return;
    }

    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        res.status(500).json('Error destroying session.');
        return;
      }

      res.clearCookie('connect.sid');
      console.log('Session destroyed');
      res.status(200).json('Logout successful');
      return;
    });
  });
};
