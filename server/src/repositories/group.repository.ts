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
  GroupRooms,
  GroupRoomSchema,
  GroupRoomsSchema,
  GroupUpdatedAt,
  GroupUpdatedAtSchema,
  NewGroupChat,
  NewGroupChatSchema,
} from '../schemas/group.schema.ts';
import { query } from '../utils/database-query.ts';

interface Database {
  query: typeof query;
}

export class Group {
  private readonly db: Database;

  constructor(db = { query }) {
    this.db = db;
  }

  createGroupsTable = async () => {
    await this.db.query(
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
      []
    );
  };

  insertNewGroupChat = async (
    ownerUserId: number,
    name: string,
    room: string
  ): Promise<NewGroupChat> => {
    const result = await this.db.query(
      `
        INSERT INTO groups (owner_user_id, name, room)
        VALUES ($1, $2, $3)
        RETURNING group_id, room, name
      `,
      [ownerUserId, name, room],
      NewGroupChatSchema
    );

    return result.rows[0];
  };

  findMembersInfoById = async (groupId: number): Promise<GroupMemberInfo[]> => {
    const result = await this.db.query(
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
      GroupMemberInfoSchema
    );

    return result.rows;
  };

  findGroupInfoByRoom = async (room: string): Promise<GroupInfo> => {
    const result = await this.db.query(
      'SELECT group_id, name, group_picture FROM groups WHERE room = $1',
      [room],
      GroupInfoSchema
    );

    return result.rows[0];
  };

  findRoomById = async (groupId: number): Promise<GroupRoom> => {
    const result = await this.db.query(
      'SELECT room FROM groups WHERE group_id = $1',
      [groupId],
      GroupRoomSchema
    );

    return result.rows[0];
  };

  findPictureById = async (groupId: number): Promise<GroupPicture> => {
    const result = await this.db.query(
      'SELECT group_picture FROM groups WHERE group_id = $1',
      [groupId],
      GroupPictureSchema
    );

    return { group_picture: result.rows[0]?.group_picture ?? null };
  };

  findDeletedForList = async (room: string): Promise<GroupDeletedForList> => {
    const result = await this.db.query(
      'SELECT deleted_for FROM groups WHERE room = $1',
      [room],
      GroupDeletedForListSchema
    );

    return { deleted_for: result.rows[0]?.deleted_for ?? null };
  };

  findUpdatedAtDate = async (room: string): Promise<GroupUpdatedAt> => {
    const result = await this.db.query(
      'SELECT updated_at FROM groups WHERE room = $1',
      [room],
      GroupUpdatedAtSchema
    );

    return result.rows[0];
  };

  findAllGroupsByUser = async (userId: number): Promise<GroupRooms> => {
    const result = await this.db.query(
      `
      SELECT g.room
      FROM groups g
      JOIN group_members gm ON g.group_id = gm.group_id
      WHERE gm.user_id = $1
      `,
      [userId],
      GroupRoomsSchema
    );

    return result.rows[0];
  };

  updatePicture = async (fileName: string, groupId: number) => {
    await this.db.query(
      'UPDATE groups SET group_picture = $1 WHERE group_id = $2',
      [fileName, groupId]
    );
  };

  setLastMessage = async (
    messageId: number,
    room: string
  ): Promise<GroupUpdatedAt> => {
    const result = await this.db.query(
      `
      UPDATE groups
      SET
        last_message_id = $1,
        updated_at = NOW()
      WHERE room = $2
      RETURNING updated_at
      `,
      [messageId, room],
      GroupUpdatedAtSchema
    );

    return result.rows[0];
  };

  updateLastMessageEventTime = async (
    messageId: number,
    room: string
  ): Promise<void> => {
    await this.db.query(
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
      [messageId, room]
    );
  };

  markReadByUser = async (userId: number, room: string): Promise<void> => {
    await this.db.query(
      `
      UPDATE groups
      SET read_by = array_append(read_by, $1)
      WHERE room = $2
      `,
      [userId, room]
    );
  };

  markUnreadByUser = async (userId: number, room: string): Promise<void> => {
    await this.db.query(
      `
      UPDATE groups
      SET read_by = array_remove(read_by, $1)
      WHERE room = $2 AND $1 = ANY(read_by)
      `,
      [userId, room]
    );
  };

  setReadBy = async (userId: number[], room: string): Promise<void> => {
    await this.db.query(
      `
      UPDATE groups
      SET read_by = $1::integer[]
      WHERE room = $2;
      `,
      [userId, room]
    );
  };

  updateDeletedForList = async (
    userId: number,
    room: string
  ): Promise<void> => {
    await this.db.query(
      `
      UPDATE groups
      SET deleted_for = array_append(deleted_for, $1)
      WHERE room = $2
      `,
      [userId, room]
    );
  };

  restore = async (room: string): Promise<void> => {
    await this.db.query(
      `
      UPDATE groups
      SET deleted_for = '{}'
      WHERE room = $1;
      `,
      [room]
    );
  };

  updateOwner = async (
    userId: number,
    groupId: number,
    room: string
  ): Promise<void> => {
    await this.db.query(
      `
      UPDATE groups
      SET owner_user_id = $1
      WHERE group_id = $2 AND room = $3
      `,
      [userId, groupId, room]
    );
  };

  deleteById = async (groupId: number): Promise<void> => {
    await this.db.query('DELETE FROM groups WHERE group_id = $1', [groupId]);
  };
}
