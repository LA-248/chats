import { pool } from '../../db/index.ts';

const Message = {
  createMessagesTable: function () {
    return new Promise((resolve, reject) => {
      pool.query(
        `
          CREATE TABLE IF NOT EXISTS messages (
            message_id SERIAL PRIMARY KEY,
            sender_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
            recipient_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
            client_offset TEXT UNIQUE,
            room UUID NOT NULL,
            content TEXT DEFAULT NULL,
            event_time TIMESTAMPTZ DEFAULT NOW(),
            is_edited BOOLEAN DEFAULT FALSE,
            UNIQUE (room, event_time, message_id)
          )
        `,
        (err) => {
          if (err) {
            return reject(`Database error in messages table: ${err.message}`);
          }
          return resolve();
        }
      );
    });
  },

  // INSERT OPERATIONS

  insertNewMessage: function (
    content,
    senderId,
    recipientId,
    room,
    clientOffset
  ) {
    return new Promise((resolve, reject) => {
      pool.query(
        `
          INSERT INTO messages (
            content,
            sender_id,
            recipient_id,
            room,
            client_offset
          ) 
          VALUES ($1, $2, $3, $4, $5)
          RETURNING message_id, event_time
        `,
        [content, senderId, recipientId, room, clientOffset],
        (err, result) => {
          if (err) {
            return reject(`Database error in messages table: ${err.message}`);
          }

          return resolve({
            id: result.rows[0].message_id,
            event_time: result.rows[0].event_time,
          });
        }
      );
    });
  },

  // UPDATE OPERATIONS

  editMessageContent: function (newMessage, messageId) {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        UPDATE messages
        SET
          content = $1,
          is_edited = true
        WHERE message_id = $2`,
        [newMessage, messageId],
        (err) => {
          if (err) {
            return reject(`Database error in messages table: ${err.message}`);
          }
          return resolve();
        }
      );
    });
  },

  // READ OPERATIONS

  retrieveMessageList: function (serverOffset, room) {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        SELECT
          m.message_id,
          m.sender_id,
          m.content,
          m.event_time,
          m.is_edited,
          u.username as sender_username,
          u.profile_picture as profile_picture
        FROM messages m
        JOIN users u
        ON m.sender_id = u.user_id
        WHERE m.message_id > $1
          AND m.room = $2
        ORDER BY m.event_time ASC;
        `,
        [serverOffset || 0, room],
        (err, result) => {
          if (err) {
            return reject(`Database error in messages table: ${err.message}`);
          }
          return resolve(result.rows);
        }
      );
    });
  },

  retrieveLastMessageInfo: function (room) {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        SELECT
          content,
          event_time
        FROM messages
        WHERE room = $1
        ORDER BY message_id DESC LIMIT 1 
        `,
        [room],
        (err, result) => {
          if (err) {
            return reject(`Database error in messages table: ${err.message}`);
          }
          return resolve(result.rows[0]);
        }
      );
    });
  },

  // DELETE OPERATIONS

  deleteMessageById: function (messageId) {
    return new Promise((resolve, reject) => {
      pool.query(
        `DELETE FROM messages WHERE message_id = $1 RETURNING *`,
        [messageId],
        (err, result) => {
          if (err) {
            return reject(`Database error in messages table: ${err.message}`);
          }
          return resolve(result.rows[0]);
        }
      );
    });
  },
};

export { Message };
