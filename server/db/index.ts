import dotenv from 'dotenv';
dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '../.env.test' : '../.env',
});

import pg from 'pg';

import { Group } from '../src/models/group.model.ts';
import { GroupMember } from '../src/models/group-member.model.ts';
import { Message } from '../src/models/message.model.ts';
import { Session } from '../src/models/session.model.ts';
import { User } from '../src/repositories/user.repository.ts';
import { PrivateChat } from '../src/repositories/private-chat.repository.ts';
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
    const userRepository = new User();
    await userRepository.createUsersTable();

    const privateChatRepository = new PrivateChat();
    await privateChatRepository.createPrivateChatsTable();

    await Group.createGroupsTable();
    await GroupMember.createGroupMemberTable();
    await Message.createMessagesTable();
    await Session.createSessionsTable();
  } catch (error) {
    console.error('Error creating table:', error);
  }
}

export { pool, createTables };
