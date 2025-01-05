import { pool } from '../../db/index.mjs';

const GroupMembers = {
  createGroupMembersTable: function () {
    return new Promise((resolve, reject) => {
      pool.query(
        `
          CREATE TABLE IF NOT EXISTS group_members (
            group_id INTEGER REFERENCES groups(group_id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
            role VARCHAR(50),
            joined_at TIMESTAMPTZ DEFAULT NOW(),
            PRIMARY KEY (group_id, user_id)
          )
        `,
        (err) => {
          if (err) {
            return reject(
              `Database error in group_members table: ${err.message}`
            );
          }
          return resolve();
        }
      );
    });
  },

  // INSERT OPERATIONS

  insertGroupMember: function (groupId, userId, role) {
    return new Promise((resolve, reject) => {
      pool.query(
        `
          INSERT INTO group_members (group_id, user_id, role)
          VALUES ($1, $2, $3)
        `,
        [groupId, userId, role],
        (err, result) => {
          if (err) {
            return reject(`Database error in group_members table: ${err.message}`);
          }
          return resolve();
        }
      );
    });
  },
};

export { GroupMembers };
