import { pool } from '../../db/index.mjs';

const GroupMemberships = {
  createGroupMembershipsTable: function () {
    return new Promise((resolve, reject) => {
      pool.query(
        `
          CREATE TABLE IF NOT EXISTS group_memberships (
            group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            role VARCHAR(50),
            joined_at TIMESTAMPTZ DEFAULT NOW(),
            PRIMARY KEY (group_id, user_id)
          )
        `,
        (err) => {
          if (err) {
            return reject(
              `Database error in group_memberships table: ${err.message}`
            );
          }
          return resolve();
        }
      );
    });
  },
};

export { GroupMemberships };
