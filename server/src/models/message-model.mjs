import { pool } from '../../db/index.mjs';

const Message = {
  // INSERT OPERATIONS

  createMessagesTable: function () {
    return new Promise((resolve, reject) => {
      pool.query(
        `CREATE TABLE IF NOT EXISTS messages (id SERIAL PRIMARY KEY, sender_username TEXT, sender_id INTEGER, recipient_id INTEGER, client_offset TEXT UNIQUE, content TEXT DEFAULT NULL, room TEXT, event_time TIMESTAMPTZ DEFAULT NOW())`,
        (err) => {
          if (err) {
            return reject(`Database error: ${err.message}`);
          }
          return resolve();
        }
      );
    });
  },

  insertNewMessage: function (
    message,
    sender_username,
    sender_id,
    recipient_id,
    room,
    clientOffset
  ) {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        INSERT INTO messages (content, sender_username, sender_id, recipient_id, room, client_offset) 
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, event_time`,
        [message, sender_username, sender_id, recipient_id, room, clientOffset],
        (err, result) => {
          if (err) {
            return reject(`Database error: ${err.message}`);
          }

          return resolve({
            id: result.rows[0].id,
            event_time: result.rows[0].event_time,
          });
        }
      );
    });
  },

  // UPDATE OPERATIONS

  editMessage: function (newMessage, messageId) {
    return new Promise((resolve, reject) => {
      pool.query(
        'UPDATE messages SET content = $1 WHERE id = $2',
        [newMessage, messageId],
        (err) => {
          if (err) {
            return reject(`Database error: ${err.message}`);
          }
          return resolve();
        }
      );
    });
  },

  updateUsernameInMessages: function (senderUsername, senderId) {
    return new Promise((resolve, reject) => {
      pool.query(
        'UPDATE messages SET sender_username = $1 WHERE sender_id = $2',
        [senderUsername, senderId],
        (err) => {
          if (err) {
            return reject(`Database error: ${err.message}`);
          }
          return resolve();
        }
      );
    });
  },

  // READ OPERATIONS

  retrieveMessageById: function (messageId) {
    return new Promise((resolve, reject) => {
      pool.query(
        'SELECT id, sender_id, content, sender_username, event_time FROM messages WHERE id = $1',
        [messageId],
        (err, result) => {
          if (err) {
            return reject(`Database error: ${err.message}`);
          }
          return resolve(result.rows[0]);
        }
      );
    });
  },

  retrieveMessages: function (serverOffset, room) {
    return new Promise((resolve, reject) => {
      pool.query(
        'SELECT id, sender_id, content, sender_username, event_time FROM messages WHERE id > $1 AND room = $2 ORDER BY event_time ASC',
        [serverOffset || 0, room],
        (err, result) => {
          if (err) {
            return reject(`Database error: ${err.message}`);
          }
          return resolve(result.rows);
        }
      );
    });
  },

  retrieveLastMessageInfo: function (room) {
    return new Promise((resolve, reject) => {
      pool.query(
        'SELECT content, event_time FROM messages WHERE room = $1 ORDER BY id DESC LIMIT 1',
        [room],
        (err, result) => {
          if (err) {
            return reject(`Database error: ${err.message}`);
          }
          return resolve(result.rows[0]);
        }
      );
    });
  },

  // DELETE OPERATIONS

  deleteMessageById: function (id) {
    return new Promise((resolve, reject) => {
      pool.query(
        'DELETE FROM messages WHERE id = $1 RETURNING *',
        [id],
        (err, result) => {
          if (err) {
            return reject(`Database error: ${err.message}`);
          }
          return resolve(result.rows[0]);
        }
      );
    });
  },
};

export { Message };
