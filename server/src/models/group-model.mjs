import { pool } from '../../db/index.mjs';

const Group = {
	createGroupsTable: function () {
		return new Promise((resolve, reject) => {
			pool.query(
				`
          CREATE TABLE IF NOT EXISTS groups (
            group_id SERIAL PRIMARY KEY,
            owner_user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
            last_message_id INTEGER REFERENCES messages(message_id) ON DELETE SET NULL,
            name TEXT,
            group_picture TEXT,
            room UUID UNIQUE NOT NULL,
            deleted_for INTEGER[],
            read_by INTEGER[],
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
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
						return reject(`Database error in groups table: ${err.message}`);
					}
					return resolve(result.rows[0]);
				}
			);
		});
	},

	// READ OPERATIONS

	retrieveGroupChats: function (userId) {
		return new Promise((resolve, reject) => {
			pool.query(
				`
        SELECT
          g.group_id,
          NULL as participant_id,
          g.name AS participant_name,
          g.group_picture AS participant_profile_picture,
          NULL AS last_message_id,
          NULL AS last_message_content,
          NULL AS last_message_time,
          g.room AS room,
          'group' AS chat_type,
          NULL AS is_read,
          g.created_at,
          NULL as updated_at,
          NULL AS user_deleted
        FROM groups g
        JOIN group_members gm ON g.group_id = gm.group_id
        WHERE gm.user_id = $1
        ORDER BY last_message_time DESC NULLS LAST
        `,
				[userId],
				(err, result) => {
					if (err) {
						return reject(`Database error in groups table: ${err.message}`);
					}
					return resolve(result.rows[0]);
				}
			);
		});
	},

	retrieveGroupInfoByRoom: function (room) {
		return new Promise((resolve, reject) => {
			pool.query(
				`SELECT group_id, name, group_picture FROM groups WHERE room = $1`,
				[room],
				(err, result) => {
					if (err) {
						return reject(`Database error in groups table: ${err.message}`);
					}
					return resolve(result.rows[0]);
				}
			);
		});
	},

	// UPDATE OPERATIONS

	updateLastMessage: function (messageId, room) {
		return new Promise((resolve, reject) => {
			pool.query(
				`
        UPDATE groups
        SET
          last_message_id = $1,
          updated_at = NOW()
        WHERE room = $2
        RETURNING *
        `,
				[messageId, room],
				(err, result) => {
					if (err) {
						return reject(`Database error in groups table: ${err.message}`);
					}
					if (!result.rows[0]) {
						return resolve(null);
					}
					return resolve();
				}
			);
		});
	},
};

export { Group };
