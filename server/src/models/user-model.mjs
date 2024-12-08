import { pool } from '../../db/index.mjs';

const User = {
  // CREATE OPERATIONS

  createUsersTable: function () {
    return new Promise((resolve, reject) => {
      pool.query(
        `
          CREATE TABLE IF NOT EXISTS users (
            user_id SERIAL PRIMARY KEY,
            username VARCHAR(30) NOT NULL UNIQUE,
            hashed_password TEXT NOT NULL,
            profile_picture TEXT DEFAULT NULL,
            blocked_users INTEGER[] DEFAULT '{}'
          )
        `,
        (err) => {
          if (err) {
            return reject(
              new Error(`Database error in users table: ${err.message}`)
            );
          }
          return resolve();
        }
      );
    });
  },

  // INSERT OPERATIONS

  insertNewUser: function (username, hashedPassword) {
    return new Promise((resolve, reject) => {
      pool.query(
        `INSERT INTO users (username, hashed_password) VALUES ($1, $2)`,
        [username, hashedPassword],
        (err) => {
          if (err) {
            return reject(`Database error in users table: ${err.message}`);
          }
          return resolve();
        }
      );
    });
  },

  // UPDATE OPERATIONS

  updateUsernameById: function (username, userId) {
    return new Promise((resolve, reject) => {
      pool.query(
        `UPDATE users SET username = $1 WHERE user_id = $2`,
        [username, userId],
        (err) => {
          if (err) {
            return reject(`Database error in users table: ${err.message}`);
          }
          return resolve();
        }
      );
    });
  },

  updateProfilePictureById: function (fileName, userId) {
    return new Promise((resolve, reject) => {
      pool.query(
        `UPDATE users SET profile_picture = $1 WHERE user_id = $2`,
        [fileName, userId],
        (err) => {
          if (err) {
            return reject(`Database error in users table: ${err.message}`);
          }
          return resolve();
        }
      );
    });
  },

  updateBlockedUsersById: function (blockedUsers, userId) {
    return new Promise((resolve, reject) => {
      pool.query(
        `UPDATE users SET blocked_users = $1 WHERE user_id = $2`,
        [blockedUsers, userId],
        (err) => {
          if (err) {
            return reject(`Database error in users table: ${err.message}`);
          }
          return resolve();
        }
      );
    });
  },

  // READ OPERATIONS

  getUserById: function (userId) {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT user_id, username, profile_picture, blocked_users FROM users WHERE user_id = $1`,
        [userId],
        (err, result) => {
          if (err) {
            return reject(`Database error in users table: ${err.message}`);
          }
          return resolve(result.rows[0]);
        }
      );
    });
  },

  getUserByUsername: function (username) {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT * FROM users WHERE username = $1`,
        [username],
        (err, result) => {
          if (err) {
            return reject(`Database error in users table: ${err.message}`);
          }
          return resolve(result.rows[0]);
        }
      );
    });
  },

  getIdByUsername: function (username) {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT user_id FROM users WHERE username = $1`,
        [username],
        (err, result) => {
          if (err) {
            return reject(`Database error in users table: ${err.message}`);
          }
          return resolve(result.rows[0]);
        }
      );
    });
  },

  getUserProfilePicture: function (userId) {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT profile_picture FROM users WHERE user_id = $1`,
        [userId],
        (err, result) => {
          if (err) {
            return reject(`Database error in users table: ${err.message}`);
          }
          if (
            result.rows.length === 0 ||
            result.rows[0].profile_picture === null
          ) {
            return resolve(null);
          }
          return resolve(result.rows[0].profile_picture);
        }
      );
    });
  },

  getBlockListById: function (userId) {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT blocked_users FROM users WHERE user_id = $1`,
        [userId],
        (err, result) => {
          if (err) {
            return reject(`Database error in users table: ${err.message}`);
          }
          if (result.rows.length === 0) {
            return resolve(null);
          }
          return resolve(result.rows[0].blocked_users);
        }
      );
    });
  },
};

export { User };
