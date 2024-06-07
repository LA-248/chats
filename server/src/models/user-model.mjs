import { db } from '../services/database.mjs';

export const getUserById = (userId) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT username FROM users WHERE id = ?', [userId], (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row);
    });
  });
};
