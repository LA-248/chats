import { db } from '../services/database.mjs';

const User = {
  insertNewUser: function(username, hashedPassword) {
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO users (username, hashed_password) VALUES (?, ?)', [username, hashedPassword], (err) => {
        if (err) {
          return reject(err);
        }
  
        resolve();
      });
    })
  },
  
  getUsernameById: function(userId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT username FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
          return reject(err);
        }
        
        resolve(user);
      });
    });
  },
  
  getUserByUsername: function(username) {
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
  },
  
  getIdByUsername: function(username) {
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
  },
};

export { User };
