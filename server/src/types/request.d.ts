declare namespace Express {
  interface Request {
    user?: {
      user_id: number;
      username: string;
      profile_picture: string;
    };
  }
}
