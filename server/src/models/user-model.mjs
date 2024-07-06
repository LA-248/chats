import { db } from '../services/database.mjs';

const insertNewUser = (username, hashedPassword) => {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO users (username, hashed_password) VALUES (?, ?)', [username, hashedPassword], (err) => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  })
}

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

const getUserByUsername = (username) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
      if (err) {
        return reject(err);
      }

      if (!user) {
        return reject('User does not exist. Make sure that the username is correct.');
      }

      resolve(user);
    });
  });
}

const getIdByUsername = (username) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT id FROM users WHERE username = ?', [username], (err, user) => {
      if (err) {
        return reject(err);
      }

      if (!user) {
        return reject('User does not exist. Make sure that the username is correct.');
      }

      resolve(user);
    });
  });
}

export { insertNewUser, getUsernameById, getUserByUsername, getIdByUsername };
