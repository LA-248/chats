import { Session } from 'express-session';
import { Socket } from 'socket.io';

export interface CustomSession extends Session {
  passport?: {
    user: number;
  };
}

declare module 'socket.io' {
  interface Handshake {
    session: CustomSession;
  }

  interface Socket {
    handshake: Handshake;
  }
}
