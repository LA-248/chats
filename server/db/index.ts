import dotenv from 'dotenv';
dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '../.env.test' : '../.env',
});

import pg from 'pg';

import { GroupMember } from '../src/repositories/group-member.repository.ts';
import { Group } from '../src/repositories/group.repository.ts';
import { Message } from '../src/repositories/message.repository.ts';
import { PrivateChat } from '../src/repositories/private-chat.repository.ts';
import { Session } from '../src/repositories/session.repository.ts';
import { User } from '../src/repositories/user.repository.ts';
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

    const groupRepository = new Group();
    await groupRepository.createGroupsTable();

    const groupMemberRepository = new GroupMember();
    await groupMemberRepository.createGroupMemberTable();

    const messageRepository = new Message();
    await messageRepository.createMessagesTable();

    const sessionRepository = new Session();
    await sessionRepository.createSessionsTable();
  } catch (error) {
    console.error('Error creating table:', error);
  }
}

export { createTables, pool };
