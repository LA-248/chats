import { pool } from '../../db/index.mjs';

const Chat = {
  // CREATE OPERATIONS
  
  createChatsTable: function () {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        CREATE TABLE IF NOT EXISTS chats (
          chat_id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          name TEXT,
          last_message TEXT,
          has_new_message BOOLEAN,
          timestamp TEXT,
          timestamp_with_seconds TEXT,
          recipient_id INTEGER,
          room TEXT
        )
      `,
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
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
    timestamp,
    timestampWithSeconds,
    recipientId,
    room
  ) {
    return new Promise((resolve, reject) => {
      pool.query(
        // Create a temporary table, allowing us to immediately retrieve the most recent state of the specified chat after insertion
        `WITH inserted AS (
          INSERT INTO chats (user_id, name, last_message, has_new_message, timestamp, timestamp_with_seconds, recipient_id, room)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        )
        SELECT *
        FROM inserted
        ORDER BY timestamp_with_seconds DESC`,
        [
          userId,
          name,
          lastMessage,
          hasNewMessage,
          timestamp,
          timestampWithSeconds,
          recipientId,
          room,
        ],
        (err, result) => {
          if (err) {
            return reject(`Database error: ${err.message}`);
          }
          return resolve(result.rows[0]);
        }
      );
    });
  },

  // READ OPERATIONS

  // Retrieve a user's chat list and sort it by timestamp
  retrieveChatListByUserId: function(userId) {
    return new Promise((resolve, reject) => {
      pool.query('SELECT * FROM chats WHERE user_id = $1 ORDER BY timestamp_with_seconds DESC', [userId], (err, result) => {
        if (err) {
          return reject(`Database error: ${err.message}`);
        }
        return resolve(result.rows);
      });
    });
  },

  // UPDATE OPERATIONS

  updateChatInChatList: function(lastMessage, timestamp, timestampWithSeconds, room) {
    return new Promise((resolve, reject) => {
      pool.query(`
        UPDATE chats 
        SET last_message = $1, timestamp = $2, timestamp_with_seconds = $3 
        WHERE room = $4 RETURNING *`, [lastMessage, timestamp, timestampWithSeconds, room], (err, result) => {
        if (err) {
          return reject(`Database error: ${err.message}`);
        }
        return resolve(result.rows[0]);
      });
    });
  },

  updateMessageReadStatus: function(hasNewMessage, room, userId) {
    return new Promise((resolve, reject) => {
      pool.query(`UPDATE chats SET has_new_message = $1 WHERE room = $2 AND user_id = $3 RETURNING *`, [hasNewMessage, room, userId], (err, result) => {
        if (err) {
          return reject(`Database error: ${err.message}`);
        }
        return resolve(result.rows[0]);
      });
    });
  },

  updateChatName: function(newUsername, userId) {
    return new Promise((resolve, reject) => {
      pool.query('UPDATE chats SET name = $1 WHERE recipient_id = $2', [newUsername, userId], (err) => {
        if (err) {
          return reject(`Database error: ${err.message}`);
        }
        return resolve();
      });
    });
  },

  // DELETE OPERATIONS

  deleteChatByUserId: function(userId, chatId) {
    return new Promise((resolve, reject) => {
      pool.query('DELETE FROM chats WHERE user_id = $1 AND chat_id = $2', [userId, chatId], (err, result) => {
        if (err) {
          return reject(`Database error: ${err.message}`);
        }
        return resolve(result.rows[0]);
      });
    });
  },
};

export { Chat };
