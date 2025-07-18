import { pool } from '../../db/index.ts';
import {
  GroupMemberPartialInfo,
  GroupMemberPartialInfoSchema,
  InsertGroupMemberSchema,
  NewGroupMember,
  NewGroupMemberSchema,
  RemovedGroupMember,
  RemovedGroupMemberSchema,
} from '../schemas/group.schema.ts';

const GroupMember = {
  createGroupMemberTable: function (): Promise<void> {
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

  insertGroupMember: function (
    groupId: number,
    userId: number,
    role: string
  ): Promise<NewGroupMember> {
    const parsed = InsertGroupMemberSchema.safeParse({ groupId, userId, role });

    if (!parsed.success) {
      console.error(
        'Error validating new group member input data:',
        parsed.error
      );
      throw new Error('Error validating new group member input data');
    }

    return new Promise((resolve, reject) => {
      pool.query(
        `
          INSERT INTO group_members (group_id, user_id, role)
          VALUES ($1, $2, $3)
          RETURNING *
        `,
        [groupId, userId, role],
        (err, result) => {
          if (err) {
            return reject(
              `Database error: Error inserting in group_members table: ${err.message}`
            );
          }

          try {
            const newGroupMember = NewGroupMemberSchema.parse(result.rows[0]);
            return resolve(newGroupMember);
          } catch (error: unknown) {
            return reject(
              `Error validating new group member data: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        }
      );
    });
  },

  // READ OPERATIONS

  retrieveMembersByRoom: function (
    room: string
  ): Promise<GroupMemberPartialInfo[] | null> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        SELECT
          gm.user_id,
          gm.role
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

          try {
            const members = result.rows.map((row) =>
              GroupMemberPartialInfoSchema.parse(row)
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

  retrieveMemberByUserId: function (
    room: string,
    groupId: number,
    userId: number
  ): Promise<GroupMemberPartialInfo> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        SELECT gm.user_id, gm.role
        FROM group_members gm
        JOIN groups g ON g.group_id = gm.group_id
        WHERE g.room = $1 AND gm.group_id = $2 AND gm.user_id = $3
        `,
        [room, groupId, userId],
        (err, result) => {
          if (err) {
            return reject(
              `Database error in group_members table: ${err.message}`
            );
          }

          try {
            const member = GroupMemberPartialInfoSchema.parse(result.rows[0]);
            return resolve(member);
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

  retrieveRandomMember: function (
    room: string,
    groupId: number
  ): Promise<GroupMemberPartialInfo> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        SELECT gm.user_id, gm.role
        FROM group_members gm
        JOIN groups g ON g.group_id = gm.group_id
        WHERE g.room = $1 AND g.group_id = $2
        LIMIT 1
        `,
        [room, groupId],
        (err, result) => {
          if (err) {
            return reject(
              `Database error in group_members table: ${err.message}`
            );
          }

          try {
            const member = GroupMemberPartialInfoSchema.parse(result.rows[0]);
            return resolve(member);
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

  // UPDATE OPERATIONS

  updateRole: function (
    role: string,
    groupId: number,
    userId: number
  ): Promise<GroupMemberPartialInfo> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        UPDATE group_members 
        SET role = $1
        WHERE group_id = $2 AND user_id = $3
        RETURNING user_id, role
        `,
        [role, groupId, userId],
        (err, result) => {
          if (err) {
            return reject(
              `Database error updating group member role in group_members table: ${err.message}`
            );
          }
          return resolve(result.rows[0]);
        }
      );
    });
  },

  // DELETE OPERATIONS

  removeGroupMember: function (
    groupId: number,
    userId: number
  ): Promise<RemovedGroupMember> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
        DELETE FROM group_members 
        WHERE group_id = $1 AND user_id = $2
        RETURNING user_id, role
        `,
        [groupId, userId],
        (err, result) => {
          if (err) {
            return reject(
              `Database error deleting group member in group_members table: ${err.message}`
            );
          }
          if (result.rows.length === 0) {
            return reject('No such group member found');
          }

          try {
            const removedUser = RemovedGroupMemberSchema.parse(result.rows[0]);
            return resolve(removedUser);
          } catch (error) {
            return reject(
              `Error validating removed group member data: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        }
      );
    });
  },
};

export { GroupMember };
