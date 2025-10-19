import {
  Chat,
  ChatDeletionStatus,
  ChatDeletionStatusSchema,
  ChatLastMessage,
  ChatLastMessageSchema,
  ChatMembers,
  ChatMembersSchema,
  ChatRoom,
  ChatRoomSchema,
  ChatSchema,
  ChatUpdatedAt,
  ChatUpdatedAtSchema,
  NewChat,
  NewChatSchema,
} from '../schemas/private-chat.schema.ts';
import { query } from '../utils/databaseQuery.ts';

interface Database {
  query: typeof query;
}

export class PrivateChat {
  private readonly db: Database;

  constructor(db = { query }) {
    this.db = db;
  }

  createPrivateChatsTable = async (): Promise<void> => {
    await this.db.query(
      `
        CREATE TABLE IF NOT EXISTS private_chats (
          chat_id SERIAL PRIMARY KEY,
          user1_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
          user2_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
          last_message_id INTEGER REFERENCES messages(message_id) ON DELETE SET NULL,
          room UUID UNIQUE NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          user1_deleted BOOLEAN DEFAULT TRUE,
          user2_deleted BOOLEAN DEFAULT TRUE,
          user1_read BOOLEAN DEFAULT TRUE,
          user2_read BOOLEAN DEFAULT TRUE,
          UNIQUE (user1_id, user2_id)
        )
      `,
      []
    );
  };

  // INSERT OPERATIONS

  insertNewChat = async (
    user1Id: number,
    user2Id: number,
    room: string
  ): Promise<NewChat> => {
    const result = await this.db.query(
      `
        INSERT INTO private_chats (user1_id, user2_id, room)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [user1Id, user2Id, room],
      NewChatSchema
    );

    return result.rows[0];
  };

  // READ OPERATIONS

  findChat = async (userId: number, room: string): Promise<Chat> => {
    const result = await this.db.query(
      `
      SELECT
        CONCAT('p_', pc.chat_id) AS chat_id,
        CASE
          WHEN pc.user1_id = $1 THEN pc.user2_id
          ELSE pc.user1_id
        END AS recipient_user_id,
        u.username AS name,
        u.profile_picture AS chat_picture,
        pc.last_message_id,
        m.content AS last_message_content,
        m.event_time AS last_message_time,
        m.type AS last_message_type,
        pc.room,
        CASE
          WHEN pc.user1_id = $1 THEN pc.user1_read
          WHEN pc.user2_id = $1 THEN pc.user2_read
        END AS read,
        'private_chat' AS chat_type,
        pc.created_at,
        pc.updated_at,
        CASE
          WHEN pc.user1_id = $1 THEN pc.user1_deleted
          WHEN pc.user2_id = $1 THEN pc.user2_deleted
        END AS deleted
      FROM private_chats pc
      JOIN users u ON u.user_id = CASE
        WHEN pc.user1_id = $1 THEN pc.user2_id
        ELSE pc.user1_id
      END
      LEFT JOIN messages m ON pc.last_message_id = m.message_id
      WHERE (pc.user1_id = $1 OR pc.user2_id = $1) AND pc.room = $2
      `,
      [userId, room],
      ChatSchema
    );

    return result.rows[0];
  };

  findMembersByRoom = async (room: string): Promise<ChatMembers | null> => {
    const result = await this.db.query(
      'SELECT user1_id, user2_id FROM private_chats WHERE room = $1',
      [room],
      ChatMembersSchema
    );

    return result.rows[0];
  };

  findRoomByMembers = async (
    user1Id: number,
    user2Id: number
  ): Promise<ChatRoom> => {
    const result = await this.db.query(
      `
      SELECT room FROM private_chats 
      WHERE (user1_id = $1 AND user2_id = $2)
      OR (user1_id = $2 AND user2_id = $1)
      `,
      [user1Id, user2Id],
      ChatRoomSchema
    );

    return { room: result.rows[0]?.room ?? null };
  };

  findAllRoomsByUser = async (userId: number): Promise<ChatRoom[]> => {
    const result = await this.db.query(
      `
      SELECT room FROM private_chats 
      WHERE (user1_id = $1 OR user2_id = $1)
      `,
      [userId],
      ChatRoomSchema
    );

    return result.rows;
  };

  findChatDeletionStatus = async (
    userId: number,
    room: string
  ): Promise<ChatDeletionStatus> => {
    const result = await this.db.query(
      `
      SELECT
        CASE
          WHEN user1_id = $1 THEN user1_deleted
          ELSE user2_deleted
        END AS deleted
      FROM private_chats
      WHERE room = $2
      `,
      [userId, room],
      ChatDeletionStatusSchema
    );

    return result.rows[0];
  };

  findUpdatedAtDate = async (room: string): Promise<ChatUpdatedAt> => {
    const result = await this.db.query(
      'SELECT updated_at FROM private_chats WHERE room = $1',
      [room],
      ChatUpdatedAtSchema
    );

    return result.rows[0];
  };

  findLastMessageId = async (room: string): Promise<ChatLastMessage> => {
    const result = await this.db.query(
      'SELECT last_message_id FROM private_chats WHERE room = $1',
      [room],
      ChatLastMessageSchema
    );

    return result.rows[0];
  };

  // UPDATE OPERATIONS

  setLastMessage = async (messageId: number, room: string): Promise<Date> => {
    const result = await this.db.query(
      `
      UPDATE private_chats
      SET
        last_message_id = $1,
        updated_at = NOW()
      WHERE room = $2
      RETURNING updated_at
      `,
      [messageId, room]
    );

    return result.rows[0].updated_at;
  };

  // Handle updating last message after most recent message is deleted
  updateLastMessage = async (
    messageId: number,
    room: string
  ): Promise<void> => {
    // When the last remaining message in a chat is deleted, the last_message_id is set to null,
    // otherwise set it to the message id of the new last message
    if (messageId === null) {
      await this.db.query(
        `
        UPDATE private_chats
        SET 
          last_message_id = NULL,
          updated_at = NOW()
        WHERE room = $1
        `,
        [room]
      );
    } else {
      await this.db.query(
        `
        UPDATE private_chats
        SET
          last_message_id = $1,
          updated_at = m.event_time
        FROM messages m
        WHERE private_chats.room = $2
          AND m.message_id = $1
          AND m.room = $2
        `,
        [messageId, room]
      );
    }
  };

  updateChatDeletionStatus = async (
    userId: number,
    isDeleted: boolean,
    room: string
  ): Promise<ChatDeletionStatus> => {
    const result = await this.db.query(
      `
      UPDATE private_chats
      SET
        user1_deleted = CASE WHEN user1_id = $1 THEN $2 ELSE user1_deleted END,
        user2_deleted = CASE WHEN user2_id = $1 THEN $2 ELSE user2_deleted END
      WHERE room = $3
      RETURNING
        CASE
          WHEN user1_id = $1 THEN user1_deleted
          WHEN user2_id = $1 THEN user2_deleted
        END AS deleted
      `,
      [userId, isDeleted, room],
      ChatDeletionStatusSchema
    );

    return result.rows[0];
  };

  updateUserReadStatus = async (
    userId: number,
    read: boolean,
    room: string
  ): Promise<void> => {
    await this.db.query(
      `
      UPDATE private_chats
      SET
        user1_read = CASE WHEN user1_id = $1 THEN $2 ELSE user1_read END,
        user2_read = CASE WHEN user2_id = $1 THEN $2 ELSE user2_read END
      WHERE room = $3
      RETURNING
        CASE
        WHEN user1_id = $1 THEN user1_read
          WHEN user2_id = $1 THEN user2_read
        END AS read
      `,
      [userId, read, room]
    );
  };
}
