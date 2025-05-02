import { Session } from 'express-session';
import { UserProfile } from '../schemas/user.schema.ts';

declare module 'socket.io' {
  interface Handshake {
    session: Session & {
      passport?: {
        user: UserProfile;
      };
    };
  }
}
