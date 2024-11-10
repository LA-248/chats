import { pool } from '../../db/index.mjs';

const PrivateChat = {
  // CREATE OPERATIONS

  createPrivateChatsTable: function () {
    return new Promise((resolve, reject) => {
      pool.query(
        `
          CREATE TABLE IF NOT EXISTS private_chats (
            chat_id SERIAL PRIMARY KEY,
            user1_id INTEGER REFERENCES users(id),
            user2_id INTEGER REFERENCES users(id),
            last_message_id INTEGER REFERENCES messages(id) ON DELETE SET NULL,
            room TEXT UNIQUE NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
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
    userId,
    name,
    lastMessage,
    hasNewMessage,
    recipientId,
    recipientProfilePicture,
    room
  ) {
    return new Promise((resolve, reject) => {
      pool.query(
        `
          INSERT INTO private_chats (user_id, name, last_message, has_new_message, recipient_id, recipient_profile_picture, room)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `,
        [
          userId,
          name,
          lastMessage,
          hasNewMessage,
          recipientId,
          recipientProfilePicture,
          room,
        ],
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
  retrieveChatListByUserId: function (userId) {
    return new Promise((resolve, reject) => {
      pool.query(
        'SELECT * FROM private_chats WHERE user_id = $1 ORDER BY event_time DESC',
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

  updateMessageReadStatus: function (hasNewMessage, room, userId) {
    return new Promise((resolve, reject) => {
      pool.query(
        `UPDATE private_chats SET has_new_message = $1 WHERE room = $2 AND user_id = $3 RETURNING *`,
        [hasNewMessage, room, userId],
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

  updateChatName: function (newUsername, userId) {
    return new Promise((resolve, reject) => {
      pool.query(
        'UPDATE private_chats SET name = $1 WHERE recipient_id = $2',
        [newUsername, userId],
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

  updateRecipientProfilePicture: function (userId) {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        UPDATE private_chats
        SET recipient_profile_picture = (
          SELECT profile_picture
          FROM users
          WHERE users.id = chats.recipient_id
        )
        WHERE EXISTS (
          SELECT 1
          FROM users
          WHERE users.id = chats.recipient_id
          AND users.id = $1
        )`,
        [userId],
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

  // DELETE OPERATIONS

  deleteChatByUserId: function (userId, chatId) {
    return new Promise((resolve, reject) => {
      pool.query(
        'DELETE FROM private_chats WHERE user_id = $1 AND chat_id = $2',
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
