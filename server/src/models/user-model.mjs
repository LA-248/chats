import { db } from '../services/database.mjs';

const getUsernameById = (userId) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT username FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) {
        return reject(err);
      }
      resolve(user);
    });
  });
};
