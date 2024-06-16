import { db } from '../services/database.mjs';

const insertNewMessage = (message, room, clientOffset) => {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO messages (content, room, client_offset) VALUES (?, ?, ?)', [message, room, clientOffset], function(err) {
      if (err) {
        reject(err);
      }
      resolve({ lastID: this.insertId });
    });
  });
};

const retrieveMessages = (serverOffset) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT content, id FROM messages WHERE id > ?', [serverOffset || 0], (_err, rows) => {
      if (_err) {
        reject(_err);
      }
      resolve(rows);
    });
  });
};

export { insertNewMessage, retrieveMessages };
