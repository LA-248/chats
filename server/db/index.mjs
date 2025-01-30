import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import pg from 'pg';
const { Pool } = pg;
import { User } from '../src/models/user-model.mjs';
import { Message } from '../src/models/message-model.mjs';
import { Session } from '../src/models/session-model.mjs';
import { PrivateChat } from '../src/models/private-chat-model.mjs';
import { Group } from '../src/models/group-model.mjs';
import { GroupMember } from '../src/models/group-member-model.mjs';

// Initialize a connection pool
const pool = new Pool({
  user: process.env.USERNAME,
  host: process.env.HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});

async function createTables() {
  try {
    await User.createUsersTable();
    await PrivateChat.createPrivateChatsTable();
    await Group.createGroupsTable();
    await GroupMember.createGroupMemberTable();
    await Message.createMessagesTable();
    await Session.createSessionsTable();
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

export { pool, createTables };
