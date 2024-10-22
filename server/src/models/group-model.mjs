import { pool } from '../../db/index.mjs';

const Group = {
  createGroupsTable: function () {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        CREATE TABLE IF NOT EXISTS groups (
          group_id SERIAL PRIMARY KEY,
          owner_user_id INTEGER REFERENCES users(id),
          sender_user_id INTEGER REFERENCES users(id),
          name TEXT,
          has_new_message BOOLEAN,
          recipient_ids INTEGER,
          group_picture TEXT,
          room TEXT
        )
      `,
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  },
};
