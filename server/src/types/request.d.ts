declare namespace Express {
  interface Request {
    user?: {
      user_id: string;
      username: string;
      profile_picture: string;
    };
  }
}
