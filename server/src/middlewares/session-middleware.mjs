import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool } from '../../db/index.mjs';

const PostgresSessionStore = connectPgSimple(session);

// Session-based auth with PostgreSQL
export const sessionMiddleware = session({
	store: new PostgresSessionStore({
		pool: pool,
		tableName: 'sessions',
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
