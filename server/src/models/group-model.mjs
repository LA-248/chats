import { pool } from '../../db/index.mjs';

const Group = {
  createGroupsTable: function () {
    return new Promise((resolve, reject) => {
      pool.query(
        `
          CREATE TABLE IF NOT EXISTS groups (
            group_id SERIAL PRIMARY KEY,
            owner_user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
            name TEXT,
            group_picture TEXT,
            room UUID NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
          )
        `,
        (err) => {
          if (err) {
            return reject(`Database error in groups table: ${err.message}`);
          }
          return resolve();
        }
      );
    });
  },

  // INSERT OPERATIONS

  insertNewGroupChat: function (ownerUserId, name, room) {
    return new Promise((resolve, reject) => {
      pool.query(
        `
          INSERT INTO groups (owner_user_id, name, room)
          VALUES ($1, $2, $3)
          RETURNING group_id
        `,
        [ownerUserId, name, room],
        (err, result) => {
          if (err) {
            return reject(
              `Database error in groups table: ${err.message}`
            );
          }
          return resolve(result.rows[0]);
        }
      );
    });
  },
};

export { Group };
