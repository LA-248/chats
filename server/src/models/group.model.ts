import { pool } from '../../db/index.ts';
import {
  GroupDeletedForList,
  GroupDeletedForListSchema,
  GroupInfo,
  GroupInfoSchema,
  GroupMemberInfo,
  GroupMemberInfoSchema,
  GroupPicture,
  GroupPictureSchema,
  GroupRoom,
  GroupRoomSchema,
  GroupUpdatedAtSchema,
  InsertGroupChatSchema,
  NewGroupChat,
  NewGroupChatSchema,
} from '../schemas/group.schema.ts';

const Group = {
  createGroupsTable: function (): Promise<void> {
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

  insertNewGroupChat: function (
    ownerUserId: number,
    name: string,
    room: string
  ): Promise<NewGroupChat> {
    const parsed = InsertGroupChatSchema.safeParse({ ownerUserId, name, room });

    if (!parsed.success) {
      console.error(
        'Error validating new group chat input data:',
        parsed.error
      );
      throw new Error('Error validating new group chat input data');
    }

    return new Promise((resolve, reject) => {
      pool.query(
        `
          INSERT INTO groups (owner_user_id, name, room)
          VALUES ($1, $2, $3)
          RETURNING group_id, room, name
        `,
        [parsed.data.ownerUserId, parsed.data.name, parsed.data.room],
        (err, result) => {
          if (err) {
            return reject(`Database error in groups table: ${err.message}`);
          }

          try {
            const newGroupChat = NewGroupChatSchema.parse(result.rows[0]);
            return resolve(newGroupChat);
          } catch (error) {
            return reject(
              `Error validating new group data: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        }
      );
    });
  },

  // READ OPERATIONS

  retrieveMembersInfo: function (groupId: number): Promise<GroupMemberInfo[]> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        SELECT
          u.user_id,
          u.username,
          u.profile_picture,
          gm.role
        FROM users u
        JOIN group_members gm ON u.user_id = gm.user_id
        WHERE gm.group_id = $1
        `,
        [groupId],
        (err, result) => {
          if (err) {
            return reject(
              `Error retrieving group members in groups database table: ${err.message}`
            );
          }
          if (result.rows.length === 0) {
            return reject(`No group found for group ID: ${groupId}`);
          }

          try {
            // Validate each row with Zod schema
            const members = result.rows.map((row) =>
              GroupMemberInfoSchema.parse(row)
            );
            return resolve(members);
          } catch (error) {
            return reject(
              `Error validating group member data: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        }
      );
    });
  },

  retrieveGroupInfoByRoom: function (room: string): Promise<GroupInfo> {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT group_id, name, group_picture FROM groups WHERE room = $1`,
        [room],
        (err, result) => {
          if (err) {
            return reject(`Database error in groups table: ${err.message}`);
          }
          if (result.rows.length === 0) {
            return reject(`No group found for room: ${room}`);
          }

          try {
            const info = GroupInfoSchema.parse(result.rows[0]);
            return resolve(info);
          } catch (error) {
            return reject(
              `Error validating group info data: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        }
      );
    });
  },

  retrieveRoomByGroupId: function (groupId: number): Promise<GroupRoom> {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT room FROM groups WHERE group_id = $1`,
        [groupId],
        (err, result) => {
          if (err) {
            return reject(`Database error in groups table: ${err.message}`);
          }
          if (result.rows.length === 0) {
            return reject(`No group found for group ID: ${groupId}`);
          }

          try {
            const validated = GroupRoomSchema.parse(result.rows[0].room);
            return resolve(validated);
          } catch (error) {
            return reject(
              `Error validating group room data: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        }
      );
    });
  },

  retrievePicture: function (room: string): Promise<GroupPicture> {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT group_picture FROM groups WHERE room = $1`,
        [room],
        (err, result) => {
          if (err) {
            return reject(`Database error in groups table: ${err.message}`);
          }
          if (result.rows.length === 0) {
            return resolve(null);
          }

          try {
            const validated = GroupPictureSchema.parse(
              result.rows[0].group_picture
            );
            return resolve(validated);
          } catch (error) {
            return reject(
              `Error validating group picture data: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        }
      );
    });
  },

  retrieveDeletedForList: function (
    room: string
  ): Promise<GroupDeletedForList> {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT deleted_for FROM groups WHERE room = $1`,
        [room],
        (err, result) => {
          if (err) {
            return reject(`Database error in groups table: ${err.message}`);
          }
          if (result.rows.length === 0) {
            return resolve(null);
          }

          try {
            const validated = GroupDeletedForListSchema.parse(
              result.rows[0].deleted_for
            );
            return resolve(validated);
          } catch (error) {
            return reject(
              `Error validating deleted list data: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        }
      );
    });
  },

  retrieveUpdatedAtDate: function (room: string) {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT updated_at FROM groups WHERE room = $1`,
        [room],
        (err, result) => {
          if (err) {
            return reject(`Database error in groups table: ${err.message}`);
          }

          try {
            const updatedAt = GroupUpdatedAtSchema.parse(
              result.rows[0].updated_at
            );
            return resolve(updatedAt);
          } catch (error) {
            return reject(
              `Error validating group chat updated at value: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        }
      );
    });
  },

  // UPDATE OPERATIONS

  updatePicture: function (fileName: string, room: string): Promise<void> {
    return new Promise((resolve, reject) => {
      pool.query(
        `UPDATE groups SET group_picture = $1 WHERE room = $2`,
        [fileName, room],
        (err) => {
          if (err) {
            return reject(`Database error in groups table: ${err.message}`);
          }
          return resolve();
        }
      );
    });
  },

  setLastMessage: function (messageId: number, room: string): Promise<Date> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        UPDATE groups
        SET
          last_message_id = $1,
          updated_at = NOW()
        WHERE room = $2
        RETURNING updated_at
        `,
        [messageId, room],
        (err, result) => {
          if (err) {
            return reject(
              `Error updating last message in groups database table: ${err.message}`
            );
          }
          const updatedAt = result.rows[0].updated_at;
          return resolve(updatedAt);
        }
      );
    });
  },

  // Handle updating last message after most recent message is deleted
  updateLastMessage: function (messageId: number, room: string): Promise<void> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        UPDATE groups
        SET
          last_message_id = $1,
          updated_at = m.event_time
        FROM messages m
        WHERE groups.room = $2
          AND m.message_id = $1
          AND m.room = $2
        `,
        [messageId, room],
        (err) => {
          if (err) {
            return reject(
              `Error updating last message in private_chats database table: ${err.message}`
            );
          }
          return resolve();
        }
      );
    });
  },

  markUserAsRead: function (userId: number, room: string): Promise<void> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        UPDATE groups
        SET read_by = array_append(read_by, $1)
        WHERE room = $2
        `,
        [userId, room],
        (err) => {
          if (err) {
            return reject(`Database error in groups table: ${err.message}`);
          }
          return resolve();
        }
      );
    });
  },

  removeUserFromReadList: function (
    userId: number,
    room: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        UPDATE groups
        SET read_by = array_remove(read_by, $1)
        WHERE room = $2 AND $1 = ANY(read_by)
        `,
        [userId, room],
        (err) => {
          if (err) {
            return reject(`Database error in groups table: ${err.message}`);
          }
          return resolve();
        }
      );
    });
  },

  resetReadByList: function (userId: number[], room: string): Promise<void> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        UPDATE groups
        SET read_by = $1::integer[]
        WHERE room = $2;
        `,
        [userId, room],
        (err) => {
          if (err) {
            return reject(
              `Error removing members from read list in groups database table: ${err.message}`
            );
          }
          return resolve();
        }
      );
    });
  },

  updateDeletedForList: function (userId: number, room: string): Promise<void> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        UPDATE groups
        SET deleted_for = array_append(deleted_for, $1)
        WHERE room = $2
        `,
        [userId, room],
        (err) => {
          if (err) {
            return reject(`Database error in groups table: ${err.message}`);
          }
          return resolve();
        }
      );
    });
  },

  restoreChat: function (room: string): Promise<void> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        UPDATE groups
        SET deleted_for = '{}'
        WHERE room = $1;
        `,
        [room],
        (err) => {
          if (err) {
            return reject(`Database error in groups table: ${err.message}`);
          }
          return resolve();
        }
      );
    });
  },
};

export { Group };
