import {
  GroupMemberInfoSchema,
  NewGroupMember,
  NewGroupMemberSchema,
} from '../schemas/group.schema.ts';
import { GroupMemberInfo } from '../types/group.ts';
import { query } from '../utils/database-query.ts';

interface Database {
  query: typeof query;
}

export class GroupMember {
  private readonly db: Database;

  constructor(db = { query }) {
    this.db = db;
  }

  createGroupMemberTable = async (): Promise<void> => {
    await this.db.query(
      `
        CREATE TABLE IF NOT EXISTS group_members (
          group_id INTEGER REFERENCES groups(group_id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
          role VARCHAR(50),
          joined_at TIMESTAMPTZ DEFAULT NOW(),
          PRIMARY KEY (group_id, user_id)
        )
      `,
      []
    );
  };

  insertGroupMember = async (
    groupId: number,
    userId: number,
    role: string
  ): Promise<NewGroupMember> => {
    const result = await this.db.query(
      `
      INSERT INTO group_members (group_id, user_id, role)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [groupId, userId, role],
      NewGroupMemberSchema
    );

    return result.rows[0];
  };

  findMembersByRoom = async (
    room: string
  ): Promise<Omit<GroupMemberInfo, 'username' | 'profile_picture'>[]> => {
    const result = await this.db.query(
      `
      SELECT
        gm.user_id,
        gm.role
      FROM group_members gm
      JOIN groups g ON g.group_id = gm.group_id
      WHERE g.room = $1
      `,
      [room],
      GroupMemberInfoSchema.omit({ username: true, profile_picture: true })
    );

    return result.rows;
  };

  findMemberByUserId = async (
    room: string,
    groupId: number,
    userId: number
  ): Promise<Omit<GroupMemberInfo, 'username' | 'profile_picture'>> => {
    const result = await this.db.query(
      `
      SELECT gm.user_id, gm.role
      FROM group_members gm
      JOIN groups g ON g.group_id = gm.group_id
      WHERE g.room = $1 AND gm.group_id = $2 AND gm.user_id = $3
      `,
      [room, groupId, userId],
      GroupMemberInfoSchema.omit({ username: true, profile_picture: true })
    );

    return result.rows[0];
  };

  findRandomMember = async (
    room: string,
    groupId: number
  ): Promise<Omit<GroupMemberInfo, 'username' | 'profile_picture'>> => {
    const result = await this.db.query(
      `
      SELECT gm.user_id, gm.role
      FROM group_members gm
      JOIN groups g ON g.group_id = gm.group_id
      WHERE g.room = $1 AND g.group_id = $2
      LIMIT 1
      `,
      [room, groupId],
      GroupMemberInfoSchema.omit({ username: true, profile_picture: true })
    );

    return result.rows[0];
  };

  updateRole = async (
    role: string,
    groupId: number,
    userId: number
  ): Promise<Omit<GroupMemberInfo, 'username' | 'profile_picture'>> => {
    const result = await this.db.query(
      `
      UPDATE group_members 
      SET role = $1
      WHERE group_id = $2 AND user_id = $3
      RETURNING user_id, role
      `,
      [role, groupId, userId],
      GroupMemberInfoSchema.omit({ username: true, profile_picture: true })
    );

    return result.rows[0];
  };

  deleteGroupMember = async (
    groupId: number,
    userId: number
  ): Promise<Omit<GroupMemberInfo, 'username' | 'profile_picture'>> => {
    const result = await this.db.query(
      `
      DELETE FROM group_members 
      WHERE group_id = $1 AND user_id = $2
      RETURNING user_id, role
      `,
      [groupId, userId],
      GroupMemberInfoSchema.omit({ username: true, profile_picture: true })
    );

    return result.rows[0];
  };
}
