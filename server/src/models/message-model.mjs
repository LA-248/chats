import { db } from '../services/database.mjs';

const insertNewMessage = (message, sender_username, sender_id, recipient_id, room, event_time, clientOffset) => {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO messages (content, sender_username, sender_id, recipient_id, room, event_time, client_offset) VALUES (?, ?, ?, ?, ?, ?, ?)', [message, sender_username, sender_id, recipient_id, room, event_time, clientOffset], function(err) {
      if (err) {
        reject(err);
      }
      resolve({ lastID: this.insertId });
    });
  });
};

const retrieveMessages = (serverOffset, room) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT content, sender_username, event_time, id FROM messages WHERE id > ? AND room = ?', [serverOffset || 0, room], (_err, rows) => {
      if (_err) {
        reject(_err);
      }
      resolve(rows);
    });
  });
};

const retrieveLastMessageInfo = (room) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT content, event_time FROM messages WHERE room = ? ORDER BY id DESC LIMIT 1', [room], (err, row) => {
      if (err) {
        reject(err);
      } else if (!row) {
        resolve({ content: null, event_time: null });
      } else {
        resolve(row);
      }
    });
  });
}

export { insertNewMessage, retrieveMessages, retrieveLastMessageInfo };
