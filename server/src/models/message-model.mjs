import { db } from '../services/database.mjs';

const Message  = {
  // INSERT OPERATIONS

  insertNewMessage: function(message, sender_username, sender_id, recipient_id, room, event_time, event_time_seconds, clientOffset) {
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO messages (content, sender_username, sender_id, recipient_id, room, event_time, event_time_seconds, client_offset) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [message, sender_username, sender_id, recipient_id, room, event_time, event_time_seconds, clientOffset], function(err) {
        if (err) {
          reject(err);
        }
        resolve({ lastID: this.insertId });
      });
    });
  },

  // READ OPERATIONS
  
  retrieveMessages: function(serverOffset, room) {
    return new Promise((resolve, reject) => {
      db.all('SELECT content, sender_username, event_time, id FROM messages WHERE id > ? AND room = ?', [serverOffset || 0, room], (_err, rows) => {
        if (_err) {
          reject(_err);
        }
        resolve(rows);
      });
    });
  },
  
  retrieveLastMessageInfo: function(room) {
    return new Promise((resolve, reject) => {
      db.get('SELECT content, event_time, event_time_seconds FROM messages WHERE room = ? ORDER BY id DESC LIMIT 1', [room], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve({ content: '', event_time: '', event_time_seconds: '' });
        } else {
          resolve(row);
        }
      });
    });
  },
};

export { Message };
