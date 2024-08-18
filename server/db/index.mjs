import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import pg from 'pg';
const { Pool } = pg;
import { User } from '../src/models/user-model.mjs';
import { Message } from '../src/models/message-model.mjs';
import { Session } from '../src/models/session-model.mjs';

const pool = new Pool({
  user: process.env.USERNAME,
  host: process.env.HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});

async function createTables() {
  try {
    await Message.createMessagesTable();
    await User.createUsersTable();
    await Session.createSessionsTable();
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

export { pool, createTables };
