import dotenv from 'dotenv';
dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '../.env.test' : '../.env',
});

import pg from 'pg';
import { User } from '../src/models/user.model.ts';
import { PrivateChat } from '../src/models/private-chat.model.ts';
import { Group } from '../src/models/group.model.ts';
import { GroupMember } from '../src/models/group-member.model.ts';
import { Message } from '../src/models/message.model.ts';
import { Session } from '../src/models/session.model.ts';
const { Pool } = pg;

// Initialise a connection pool
const pool = new Pool({
  user: process.env.USERNAME,
  host: process.env.HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: Number(process.env.DATABASE_PORT),
});

async function createTables(): Promise<void> {
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
