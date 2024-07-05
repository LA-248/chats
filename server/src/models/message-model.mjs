import { db } from '../services/database.mjs';

const insertNewMessage = (message, sender_username, room, clientOffset) => {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO messages (content, sender_username, room, client_offset) VALUES (?, ?, ?, ?)', [message, sender_username, room, clientOffset], function(err) {
      if (err) {
        reject(err);
      }
      resolve({ lastID: this.insertId });
    });
  });
};

const retrieveMessages = (serverOffset, room) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT content, sender_username, id FROM messages WHERE id > ? AND room = ?', [serverOffset || 0, room], (_err, rows) => {
      if (_err) {
        reject(_err);
      }
      resolve(rows);
    });
  });
};

export { insertNewMessage, retrieveMessages };
