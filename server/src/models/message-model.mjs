import { pool } from "../../db/index.mjs";

const Message  = {
  // INSERT OPERATIONS

  createMessagesTable: function() {
    return new Promise((resolve, reject) => {
      pool.query(`CREATE TABLE IF NOT EXISTS messages (id SERIAL PRIMARY KEY, sender_username TEXT, sender_id INTEGER, recipient_id INTEGER, client_offset TEXT UNIQUE, content TEXT DEFAULT NULL, room TEXT, event_time TEXT DEFAULT NULL, event_time_seconds TEXT DEFAULT NULL)`, (err) => {
        if (err) {
          return reject(`Database error: ${err.message}`);
        }
        return resolve();
      });
    });
  },

  insertNewMessage: function(message, sender_username, sender_id, recipient_id, room, event_time, event_time_seconds, clientOffset) {
    return new Promise((resolve, reject) => {
      pool.query(`
        INSERT INTO messages (content, sender_username, sender_id, recipient_id, room, event_time, event_time_seconds, client_offset) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`, 
        [message, sender_username, sender_id, recipient_id, room, event_time, event_time_seconds, clientOffset], 
        (err, result) => {
          if (err) {
            return reject(`Database error: ${err.message}`);
          }

          return resolve({ lastID: result.rows[0].id });
        });
    });
  },

  // READ OPERATIONS
  
  retrieveMessages: function(serverOffset, room) {
    return new Promise((resolve, reject) => {
      pool.query('SELECT content, sender_username, event_time, id FROM messages WHERE id > $1 AND room = $2', [serverOffset || 0, room], (err, result) => {
        if (err) {
          return reject(`Database error: ${err.message}`);
        }
        return resolve(result.rows);
      });
    });
  },
  
  retrieveLastMessageInfo: function(room) {
    return new Promise((resolve, reject) => {
      pool.query('SELECT content, event_time, event_time_seconds FROM messages WHERE room = $1 ORDER BY id DESC LIMIT 1', [room], (err, result) => {
        if (err) {
          return reject(`Database error: ${err.message}`);
        }
        return resolve(result.rows[0]);
      });
    });
  },
};

export { Message };
