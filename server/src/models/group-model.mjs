import { pool } from '../../db/index.mjs';

const Group = {
  createGroupsTable: function () {
    return new Promise((resolve, reject) => {
      pool.query(
        `
          CREATE TABLE IF NOT EXISTS groups (
            group_id SERIAL PRIMARY KEY,
            owner_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            name TEXT,
            group_picture TEXT,
            room TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
          )
        `,
        (err) => {
          if (err) {
            reject(`Database error in groups table: ${err.message}`);
          }
          return resolve();
        }
      );
    });
  },
};

export { Group };
