import { pool } from '../../db/index.ts';
import {
  Chat,
  ChatDeletionStatus,
  ChatDeletionStatusSchema,
  ChatMembers,
  ChatMembersSchema,
  ChatRoom,
  ChatRoomSchema,
  ChatSchema,
  ChatUpdatedAtSchema,
  InsertPrivateChatSchema,
  NewChat,
  NewChatSchema,
} from '../schemas/private-chat.schema.ts';

const PrivateChat = {
  // CREATE OPERATIONS

  createPrivateChatsTable: function (): Promise<void> {
    return new Promise((resolve, reject) => {
      pool.query(
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
    const parsed = InsertPrivateChatSchema.safeParse({
      user1Id,
      user2Id,
      room,
    });

    if (!parsed.success) {
      console.error(
        'Error validating new private chat input data:',
        parsed.error
      );
      throw new Error('Error validating new private chat input data');
    }

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

  retrieveChat: function (userId: number, room: string): Promise<Chat> {
    return new Promise((resolve, reject) => {
      pool.query(
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
        (err, result) => {
          if (err) {
            return reject(`Database error: ${err.message}`);
          }

          try {
            const newestChat = ChatSchema.parse(result.rows[0]);
            return resolve(newestChat);
          } catch (error) {
            return reject(
              `Error validating chat data: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        }
      );
    });
  },

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
          if (result.rowCount === 0) {
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

  retrieveAllRoomsByUser: function (userId: number): Promise<ChatRoom[]> {
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

          try {
            const rooms = result.rows.map((row) =>
              ChatRoomSchema.parse(row.room)
            );
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

  retrieveUpdatedAtDate: function (room: string) {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT updated_at FROM private_chats WHERE room = $1`,
        [room],
        (err, result) => {
          if (err) {
            return reject(
              `Database error in private_chats table: ${err.message}`
            );
          }

          try {
            const updatedAt = ChatUpdatedAtSchema.parse(
              result.rows[0].updated_at
            );
            return resolve(updatedAt);
          } catch (error) {
            return reject(
              `Error validating private chat updated at value: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        }
      );
    });
  },

  // UPDATE OPERATIONS

  setLastMessage: function (messageId: number, room: string): Promise<Date> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        UPDATE private_chats
        SET
          last_message_id = $1,
          updated_at = NOW()
        WHERE room = $2
        RETURNING updated_at
        `,
        [messageId, room],
        (err, result) => {
          if (err) {
            return reject(
              `Error setting last message in private_chats database table: ${err.message}`
            );
          }
          const updatedAt = result.rows[0].updated_at;
          return resolve(updatedAt);
        }
      );
    });
  },

  // Handle updating last message after most recent message is deleted
  updateLastMessage: function (messageId: number, room: string): Promise<void> {
    return new Promise((resolve, reject) => {
      pool.query(
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
        [messageId, room],
        (err) => {
          if (err) {
            return reject(
              `Error updating last message in private_chats database table: ${err.message}`
            );
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
