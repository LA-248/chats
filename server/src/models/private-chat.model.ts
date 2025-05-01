import { pool } from '../../db/index.ts';
import {
  ChatDeletionStatus,
  ChatDeletionStatusSchema,
  ChatMembers,
  ChatMembersSchema,
  ChatRoom,
  ChatRoomSchema,
  NewChat,
  NewChatSchema,
} from '../schemas/chat.schema.ts';

const PrivateChat = {
  // CREATE OPERATIONS

  createPrivateChatsTable: function (): Promise<void> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
          CREATE TABLE IF NOT EXISTS private_chats (
            chat_id SERIAL PRIMARY KEY,
            user1_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
            user2_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
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
        (err) => {
          if (err) {
            return reject(
              `Database error in private_chats table: ${err.message}`
            );
          }
          return resolve();
        }
      );
    });
  },

  // INSERT OPERATIONS

  insertNewChat: function (
    user1Id: number,
    user2Id: number,
    room: string
  ): Promise<NewChat> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
          INSERT INTO private_chats (user1_id, user2_id, room)
          VALUES ($1, $2, $3)
          RETURNING *
        `,
        [user1Id, user2Id, room],
        (err, result) => {
          if (err) {
            return reject(
              `Database error in private_chats table: ${err.message}`
            );
          }

          try {
            const newChat = NewChatSchema.parse(result.rows[0]);
            return resolve(newChat);
          } catch (error) {
            return reject(
              `Error validating new chat data: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        }
      );
    });
  },

  // READ OPERATIONS

  retrieveMembersByRoom: function (room: string): Promise<ChatMembers | null> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        SELECT user1_id, user2_id FROM private_chats WHERE room = $1
        `,
        [room],
        (err, result) => {
          if (err) {
            return reject(
              `Database error in private_chats table: ${err.message}`
            );
          }
          if (result.rows.length === 0) {
            return resolve(null);
          }

          try {
            const members = ChatMembersSchema.parse(result.rows[0]);
            return resolve(members);
          } catch (error) {
            return reject(
              `Error validating chat member data: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        }
      );
    });
  },

  retrieveRoomByMembers: function (
    user1Id: number,
    user2Id: number
  ): Promise<ChatRoom | null> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        SELECT room FROM private_chats 
        WHERE (user1_id = $1 AND user2_id = $2)
        OR (user1_id = $2 AND user2_id = $1)
        `,
        [user1Id, user2Id],
        (err, result) => {
          if (err) {
            return reject(
              `Database error in private_chats table: ${err.message}`
            );
          }
          if (result.rows.length === 0) {
            return resolve(null);
          }

          try {
            const room = ChatRoomSchema.parse(result.rows[0].room);
            return resolve(room);
          } catch (error) {
            return reject(
              `Error validating room: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        }
      );
    });
  },

  retrieveAllRoomsByUser: function (
    userId: number
  ): Promise<ChatRoom[] | null> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        SELECT room FROM private_chats 
        WHERE (user1_id = $1 OR user2_id = $1)
        `,
        [userId],
        (err, result) => {
          if (err) {
            return reject(
              `Database error in private_chats table: ${err.message}`
            );
          }
          if (result.rows.length === 0) {
            return resolve(null);
          }

          try {
            const rooms = result.rows.map((row) => ChatRoomSchema.parse(row));
            return resolve(rooms);
          } catch (error) {
            return reject(
              `Error validating rooms: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        }
      );
    });
  },

  retrieveChatDeletionStatus: function (
    userId: number,
    room: string
  ): Promise<ChatDeletionStatus | null> {
    return new Promise((resolve, reject) => {
      pool.query(
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
        (err, result) => {
          if (err) {
            return reject(
              `Database error in private_chats table: ${err.message}`
            );
          }
          if (result.rowCount === 0) {
            return resolve(null);
          }

          try {
            const deletionStatus = ChatDeletionStatusSchema.parse(
              result.rows[0].deleted
            );
            return resolve(deletionStatus);
          } catch (error) {
            return reject(
              `Error validating chat deletion status: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        }
      );
    });
  },

  // UPDATE OPERATIONS

  updateLastMessage: function (
    messageId: number,
    room: string
  ): Promise<void | null> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        UPDATE private_chats
        SET
          last_message_id = $1,
          updated_at = NOW()
        WHERE room = $2
        `,
        [messageId, room],
        (err, result) => {
          if (err) {
            return reject(
              `Error updating last message in private_chats database table: ${err.message}`
            );
          }
          if (!result.rows[0]) {
            return resolve(null);
          }
          return resolve();
        }
      );
    });
  },

  updateChatDeletionStatus: function (
    userId: number,
    isDeleted: boolean,
    room: string
  ): Promise<ChatDeletionStatus> {
    return new Promise((resolve, reject) => {
      pool.query(
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
        (err, result) => {
          if (err) {
            return reject(
              `Database error in private_chats table: ${err.message}`
            );
          }
          if (result.rowCount === 0) {
            return reject('Chat not found');
          }

          try {
            const deletionStatus = ChatDeletionStatusSchema.parse(
              result.rows[0].deleted
            );
            return resolve(deletionStatus);
          } catch (error) {
            return reject(
              `Error validating chat deletion status: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        }
      );
    });
  },

  updateUserReadStatus: function (
    userId: number,
    read: boolean,
    room: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      pool.query(
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
        [userId, read, room],
        (err) => {
          if (err) {
            return reject(
              `Error updating read status in private_chats database table:: ${err.message}`
            );
          }
          return resolve();
        }
      );
    });
  },
};

export { PrivateChat };
