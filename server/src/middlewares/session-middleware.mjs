import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';

const SQLiteStore = connectSqlite3(session);

// Session-based auth
export const sessionMiddleware = session({
  store: new SQLiteStore({
    db: '../db/database.db',
    table: 'sessions',
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: process.env.NODE_ENV === 'production',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  },
});
