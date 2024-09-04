import { pool } from '../../db/index.mjs';

const User = {
  // CREATE OPERATIONS

  createUsersTable: function() {
    return new Promise((resolve, reject) => {
      pool.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username TEXT, hashed_password TEXT, blocked_users INTEGER[] DEFAULT '{}')`, (err) => {
        if (err) {
          return reject(`Database error: ${err.message}`);
        }
        return resolve();
      });
    });
  },

  // INSERT OPERATIONS

  insertNewUser: function(username, hashedPassword) {
    return new Promise((resolve, reject) => {
      pool.query('INSERT INTO users (username, hashed_password) VALUES ($1, $2)', [username, hashedPassword], (err) => {
        if (err) {
          return reject(`Database error: ${err.message}`);
        }
        return resolve();
      });
    })
  },

  // UPDATE OPERATIONS

  updateBlockedUsersById: function(blockedUser, userId) {
    return new Promise((resolve, reject) => {
      // Check if the blocked user is already in the blocked_users array
      pool.query('SELECT blocked_users FROM users WHERE id = $1', [userId], (err, result) => {
        if (err) {
          return reject(`Database error: ${err.message}`);
        }
  
        const blockedUsers = result.rows[0].blocked_users;
        if (blockedUsers.includes(blockedUser)) {
          // The blocked user is already in the array, return without updating
          return resolve();
        }
  
        // The blocked user is not in the array, update it
        pool.query('UPDATE users SET blocked_users = ARRAY_APPEND(blocked_users, $1) WHERE id = $2', [blockedUser, userId], (err) => {
          if (err) {
            return reject(`Database error: ${err.message}`);
          }
          return resolve();
        });
      });
    });
  },

  // READ OPERATIONS

  getUserById: function(userId) {
    return new Promise((resolve, reject) => {
      pool.query('SELECT * FROM users WHERE id = $1', [userId], (err, result) => {
        if (err) {
          return reject(`Database error: ${err.message}`);
        }
        return resolve(result.rows[0]);
      });
    });
  },
  
  getUserByUsername: function(username) {
    return new Promise((resolve, reject) => {
      pool.query('SELECT * FROM users WHERE username = $1', [username], (err, result) => {
        if (err) {
          return reject(`Database error: ${err.message}`);
        }
        return resolve(result.rows[0]);
      });
    });
  },
  
  getIdByUsername: function(username) {
    return new Promise((resolve, reject) => {
      pool.query('SELECT id FROM users WHERE username = $1', [username], (err, result) => {
        if (err) {
          return reject(`Database error: ${err.message}`);
        }
        return resolve(result.rows[0]);
      });
    });
  },

  getChatListByUserId: function(userId) {
    return new Promise((resolve, reject) => {
      pool.query('SELECT chat_list FROM users WHERE id = $1', [userId], (err, result) => {
        if (err) {
          return reject(`Database error: ${err.message}`);
        }
        return resolve(result.rows[0]);
      });
    });
  },

  getBlockListById: function(userId) {
    return new Promise((resolve, reject) => {
      pool.query('SELECT blocked_users FROM users WHERE id = $1', [userId], (err, result) => {
        if (err) {
          return reject(`Database error: ${err.message}`);
        }
        return resolve(result.rows[0].blocked_users);
      });
    })
  },
};

export { User };
