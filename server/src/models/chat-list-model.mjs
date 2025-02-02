import { pool } from '../../db/index.mjs';

// Combine private and group chats to display them all in the user's chat list
const Chat = {
	retrieveAllChats: function (userId) {
		return new Promise((resolve, reject) => {
			pool.query(
				`
        SELECT
          CONCAT('p_', pc.chat_id) AS chat_id,
          CASE
            WHEN pc.user1_id = $1 THEN pc.user2_id
            ELSE pc.user1_id
          END AS recipient_user_id,
          u.username AS recipient_username,
          u.profile_picture AS recipient_profile_picture,
          pc.last_message_id,
          m.content AS last_message_content,
          m.event_time AS last_message_time,
          pc.room,
          CASE
            WHEN pc.user1_id = $1 THEN pc.user1_read
            WHEN pc.user2_id = $1 THEN pc.user2_read
          END AS read,
          'private_chat' AS chat_type,
          pc.created_at,
          pc.updated_at,
          CASE
            WHEN pc.user1_id = $1 THEN pc.user1_deleted
            WHEN pc.user2_id = $1 THEN pc.user2_deleted
          END AS user_deleted
        FROM private_chats pc
        JOIN users u ON u.user_id = CASE
          WHEN pc.user1_id = $1 THEN pc.user2_id
          ELSE pc.user1_id
        END
        LEFT JOIN messages m ON pc.last_message_id = m.message_id
        WHERE (pc.user1_id = $1 OR pc.user2_id = $1)

        UNION ALL

        SELECT
          CONCAT('g_', g.group_id) AS chat_id,
          NULL as recipient_user_id,
          g.name AS recipient_username,
          g.group_picture AS recipient_profile_picture,
          g.last_message_id,
          m.content AS last_message_content,
          m.event_time AS last_message_time,
          g.room,
          NULL AS read,
          'group' AS chat_type,
          g.created_at,
          NULL AS updated_at,
          FALSE AS user_deleted
        FROM groups g
        JOIN group_members gm ON g.group_id = gm.group_id
        LEFT JOIN messages m ON g.last_message_id = m.message_id
        WHERE gm.user_id = $1

        ORDER BY last_message_time DESC NULLS LAST
        `,
				[userId],
				(err, result) => {
					if (err) {
						return reject(`Database error: ${err.message}`);
					}
					return resolve(result.rows);
				}
			);
		});
	},
};

export { Chat };
