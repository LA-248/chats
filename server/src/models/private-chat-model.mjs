import { pool } from '../../db/index.mjs';

const PrivateChat = {
  // CREATE OPERATIONS

  createPrivateChatsTable: function () {
    return new Promise((resolve, reject) => {
      pool.query(
        `
          CREATE TABLE IF NOT EXISTS private_chats (
            chat_id SERIAL PRIMARY KEY,
            user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            last_message_id INTEGER REFERENCES messages(message_id) ON DELETE SET NULL,
            room TEXT UNIQUE NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            user1_deleted BOOLEAN DEFAULT FALSE,
            user2_deleted BOOLEAN DEFAULT FALSE,
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

  insertNewChat: function (user1Id, user2Id, lastMessageId, createdAt, room) {
    return new Promise((resolve, reject) => {
      pool.query(
        `
          INSERT INTO private_chats (user1_id, user2_id, last_message_id, created_at, room)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `,
        [user1Id, user2Id, lastMessageId, createdAt, room],
        (err, result) => {
          if (err) {
            return reject(
              `Database error in private_chats table: ${err.message}`
            );
          }
          return resolve(result.rows[0]);
        }
      );
    });
  },

  // READ OPERATIONS

  // Retrieve a user's chat list and sort it by timestamp
  // Use a CASE expression to dynamically identify the other user involved in the chat for any given user
  retrieveChatListByUserId: function (userId) {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT
          chat_id,
          CASE
            WHEN user1_id = $1 THEN user2_id
            ELSE user1_id
          END AS recipient_user_id
          last_message_id,
          room,
          created_at,
          updated_at
        FROM private_chats 
        WHERE user1_id = $1 OR user2_id = $1 
        ORDER BY updated_at DESC`,
        [userId],
        (err, result) => {
          if (err) {
            return reject(
              `Database error in private_chats table: ${err.message}`
            );
          }
          return resolve(result.rows);
        }
      );
    });
  },

  // UPDATE OPERATIONS

  updateChatInChatList: function (lastMessage, room) {
    return new Promise((resolve, reject) => {
      pool.query(
        `UPDATE private_chats 
         SET last_message = $1, event_time = NOW() 
         WHERE room = $2 
         RETURNING *`,
        [lastMessage, room],
        (err, result) => {
          if (err) {
            return reject(
              `Database error in private_chats table: ${err.message}`
            );
          }
          return resolve(result.rows[0]);
        }
      );
    });
  },

  deleteChatByUserId: function (userId, chatId) {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        UPDATE private_chats
        SET
          user1_deleted = CASE WHEN user1_id = $1 THEN TRUE ELSE user1_deleted END,
          user2_deleted = CASE WHEN user2_id = $1 THEN TRUE ELSE user2_deleted END
        WHERE chat_id = $2
        RETURNING *
        `,
        [userId, chatId],
        (err, result) => {
          if (err) {
            return reject(
              `Database error in private_chats table: ${err.message}`
            );
          }
          return resolve(result.rows[0]);
        }
      );
    });
  },
};

export { PrivateChat };
