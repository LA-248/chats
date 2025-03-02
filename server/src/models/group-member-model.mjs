import { pool } from '../../db/index.mjs';

const GroupMember = {
	createGroupMemberTable: function () {
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
							`Database error: Error creating group_members table: ${err.message}`
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
				(err) => {
					if (err) {
						return reject(
							`Database error: Error inserting in group_members table: ${err.message}`
						);
					}
					return resolve();
				}
			);
		});
	},

	// READ OPERATIONS

	retrieveMembersByRoom: function (room) {
		return new Promise((resolve, reject) => {
			pool.query(
				`
        SELECT
          gm.user_id
        FROM group_members gm
        JOIN groups g ON g.group_id = gm.group_id
        WHERE g.room = $1
        `,
				[room],
				(err, result) => {
					if (err) {
						return reject(
							`Database error in group_members table: ${err.message}`
						);
					}
					if (result.rows.length === 0) {
						return resolve(null);
					}
					return resolve(result.rows);
				}
			);
		});
	},

	// DELETE OPERATIONS

	removeGroupMember: function (groupId, userId) {
		return new Promise((resolve, reject) => {
			pool.query(
				`
        DELETE FROM group_members 
        WHERE group_id = $1 AND user_id = $2;
        `,
				[groupId, userId],
				(err) => {
					if (err) {
						return reject(
							`Database error deleting group member in group_members table: ${err.message}`
						);
					}
					return resolve();
				}
			);
		});
	},
};

export { GroupMember };
