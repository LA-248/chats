import dotenv from 'dotenv';
dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '../.env.test' : '../.env',
});

import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool } from '../../db/index.ts';

const PostgresSessionStore = connectPgSimple(session);

// Session-based auth with PostgreSQL
export const sessionMiddleware = session({
  store: new PostgresSessionStore({
    pool: pool,
    tableName: 'sessions',
  }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  },
});
