import { pool } from '../../db/index.mjs';

const PrivateChat = {
	// CREATE OPERATIONS

	createPrivateChatsTable: function () {
		return new Promise((resolve, reject) => {
			pool.query(
				`
          CREATE TABLE IF NOT EXISTS private_chats (
            chat_id SERIAL PRIMARY KEY,
            user1_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
            user2_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
            last_message_id INTEGER REFERENCES messages(message_id) ON DELETE SET NULL,
            room UUID UNIQUE NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            user1_deleted BOOLEAN DEFAULT TRUE,
            user2_deleted BOOLEAN DEFAULT TRUE,
            user1_read BOOLEAN DEFAULT TRUE,
            user2_read BOOLEAN DEFAULT TRUE,
            UNIQUE (user1_id, user2_id)
          )
        `,
				(err) => {
					if (err) {
						return reject(
							`Database error in private_chats table: ${err.message}`
						);
					}
					return resolve();
				}
			);
		});
	},

	// INSERT OPERATIONS

	insertNewChat: function (user1Id, user2Id, room) {
		return new Promise((resolve, reject) => {
			pool.query(
				`
          INSERT INTO private_chats (user1_id, user2_id, room)
          VALUES ($1, $2, $3)
          RETURNING *
        `,
				[user1Id, user2Id, room],
				(err, result) => {
					if (err) {
						return reject(
							`Database error in private_chats table: ${err.message}`
						);
					}
					return resolve(result.rows[0]);
				}
			);
		});
	},

	// READ OPERATIONS

	// Retrieve all private chats for a user and sort it by timestamp
	// Use a CASE expression to dynamically identify the other user involved in the chat for any given user
	retrievePrivateChatsByUserId: function (userId) {
		return new Promise((resolve, reject) => {
			pool.query(
				`
        SELECT
          pc.chat_id,
          CASE
            WHEN pc.user1_id = $1 THEN pc.user2_id
            ELSE pc.user1_id
          END AS recipient_user_id,
          u.username AS name,
          u.profile_picture AS recipient_profile_picture,
          pc.last_message_id,
          m.content AS last_message_content,
          m.event_time AS last_message_time,
          pc.room,
          CASE
            WHEN pc.user1_id = $1 THEN pc.user1_read
            WHEN pc.user2_id = $1 THEN pc.user2_read
          END AS read,
          pc.created_at,
          pc.updated_at,
          CASE
            WHEN pc.user1_id = $1 THEN pc.user1_deleted
            WHEN pc.user2_id = $1 THEN pc.user2_deleted
          END AS deleted
        FROM private_chats pc
        JOIN users u ON u.user_id = CASE
          WHEN pc.user1_id = $1 THEN pc.user2_id
          ELSE pc.user1_id
        END
        LEFT JOIN messages m ON pc.last_message_id = m.message_id
        WHERE (pc.user1_id = $1 OR pc.user2_id = $1)
        ORDER BY last_message_time DESC NULLS LAST
        `,
				[userId],
				(err, result) => {
					if (err) {
						return reject(
							`Database error in private_chats table: ${err.message}`
						);
					}
					return resolve(result.rows);
				}
			);
		});
	},

	retrieveMembersByRoom: function (room) {
		return new Promise((resolve, reject) => {
			pool.query(
				`
        SELECT user1_id, user2_id FROM private_chats WHERE room = $1
        `,
				[room],
				(err, result) => {
					if (err) {
						return reject(
							`Database error in private_chats table: ${err.message}`
						);
					}
					if (result.rows.length === 0) {
						return resolve(null);
					}
					return resolve(result.rows[0]);
				}
			);
		});
	},

	retrieveRoomByMembers: function (user1Id, user2Id) {
		return new Promise((resolve, reject) => {
			pool.query(
				`
        SELECT room FROM private_chats 
        WHERE (user1_id = $1 AND user2_id = $2)
        OR (user1_id = $2 AND user2_id = $1)
        `,
				[user1Id, user2Id],
				(err, result) => {
					if (err) {
						return reject(
							`Database error in private_chats table: ${err.message}`
						);
					}
					if (result.rows.length === 0) {
						return resolve(null);
					}
					return resolve(result.rows[0].room);
				}
			);
		});
	},

	retrieveChatDeletionStatus: function (userId, room) {
		return new Promise((resolve, reject) => {
			pool.query(
				`
        SELECT
          CASE
            WHEN user1_id = $1 THEN user1_deleted
            ELSE user2_deleted
          END AS deleted
        FROM private_chats
        WHERE room = $2
        `,
				[userId, room],
				(err, result) => {
					if (err) {
						return reject(
							`Database error in private_chats table: ${err.message}`
						);
					}
					if (result.rowCount === 0) {
						return resolve(null);
					}
					return resolve(result.rows[0].deleted);
				}
			);
		});
	},

	// UPDATE OPERATIONS

	updateLastMessage: function (messageId, room) {
		return new Promise((resolve, reject) => {
			pool.query(
				`
        UPDATE private_chats
        SET
          last_message_id = $1,
          updated_at = NOW()
        WHERE room = $2
        RETURNING *
        `,
				[messageId, room],
				(err, result) => {
					if (err) {
						return reject(
							`Error updating last message in private_chats database table: ${err.message}`
						);
					}
					if (!result.rows[0]) {
						return resolve(null);
					}
					return resolve();
				}
			);
		});
	},

	updateChatDeletionStatus: function (userId, isDeleted, room) {
		return new Promise((resolve, reject) => {
			pool.query(
				`
        UPDATE private_chats
        SET
          user1_deleted = CASE WHEN user1_id = $1 THEN $2 ELSE user1_deleted END,
          user2_deleted = CASE WHEN user2_id = $1 THEN $2 ELSE user2_deleted END
        WHERE room = $3
        RETURNING
          CASE
            WHEN user1_id = $1 THEN user1_deleted
            WHEN user2_id = $1 THEN user2_deleted
          END AS deleted
        `,
				[userId, isDeleted, room],
				(err, result) => {
					if (err) {
						return reject(
							`Database error in private_chats table: ${err.message}`
						);
					}
					if (result.rowCount === 0) {
						return reject('Chat not found');
					}
					return resolve(result.rows[0]);
				}
			);
		});
	},

	updateUserReadStatus: function (userId, read, room) {
		return new Promise((resolve, reject) => {
			pool.query(
				`
        UPDATE private_chats
        SET
          user1_read = CASE WHEN user1_id = $1 THEN $2 ELSE user1_read END,
          user2_read = CASE WHEN user2_id = $1 THEN $2 ELSE user2_read END
        WHERE room = $3
        RETURNING
          CASE
            WHEN user1_id = $1 THEN user1_read
            WHEN user2_id = $1 THEN user2_read
          END AS read
        `,
				[userId, read, room],
				(err) => {
					if (err) {
						return reject(
							`Error updating read status in private_chats database table:: ${err.message}`
						);
					}
					return resolve();
				}
			);
		});
	},
};

export { PrivateChat };
