import { query } from '../utils/databaseQuery.ts';
import {
  UserEntity,
  UserProfile,
  UserProfileSchema,
  UserEntitySchema,
  RecipientUserProfile,
  RecipientUserProfileSchema,
  UserId,
  UserIdSchema,
  UserProfilePicture,
  UserProfilePictureSchema,
  UserBlockList,
  UserBlockListSchema,
} from '../schemas/user.schema.ts';

export class User {
  private readonly db: { query: typeof query };

  constructor(db = { query }) {
    this.db = db;
  }

  createUsersTable = async (): Promise<void> => {
    await this.db.query(
      `CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(30) NOT NULL UNIQUE,
        hashed_password TEXT NOT NULL,
        profile_picture TEXT DEFAULT NULL,
        blocked_users INTEGER[] DEFAULT '{}'
      )`,
      []
    );
  };

  // INSERT OPERATIONS

  insertUser = async (
    username: string,
    hashedPassword: string
  ): Promise<void> => {
    await this.db.query(
      'INSERT INTO users (username, hashed_password) VALUES ($1, $2)',
      [username, hashedPassword]
    );
  };

  // READ OPERATIONS

  findUserById = async (userId: number): Promise<UserProfile> => {
    const result = await this.db.query<UserProfile>(
      'SELECT user_id, username, profile_picture FROM users WHERE user_id = $1',
      [userId],
      UserProfileSchema
    );

    return result.rows[0];
  };

  findUserByUsername = async (username: string): Promise<UserEntity> => {
    const result = await this.db.query<UserEntity>(
      'SELECT * FROM users WHERE username = $1',
      [username],
      UserEntitySchema
    );

    return result.rows[0];
  };

  findRecipientUserProfileById = async (
    userId: number,
    room: string
  ): Promise<RecipientUserProfile> => {
    const result = await query<RecipientUserProfile>(
      `
        SELECT
          u.user_id,
          u.username,
          u.profile_picture,
          u.blocked_users
        FROM users u
        JOIN private_chats pc ON u.user_id = CASE
          WHEN pc.user1_id = $1 THEN pc.user2_id
          ELSE pc.user1_id
        END
        WHERE pc.room = $2
        `,
      [userId, room],
      RecipientUserProfileSchema
    );

    return result.rows[0];
  };

  findUserIdByUsername = async (username: string): Promise<UserId> => {
    const result = await query<UserId>(
      'SELECT user_id FROM users WHERE username = $1',
      [username],
      UserIdSchema
    );

    return result.rows[0];
  };

  findUserProfilePictureById = async (
    userId: number
  ): Promise<UserProfilePicture> => {
    const result = await query<UserProfilePicture>(
      'SELECT profile_picture FROM users WHERE user_id = $1',
      [userId],
      UserProfilePictureSchema
    );

    return result.rows[0];
  };

  findBlockListById = async (userId: number): Promise<UserBlockList> => {
    const result = await query<UserBlockList>(
      'SELECT blocked_users FROM users WHERE user_id = $1',
      [userId],
      UserBlockListSchema
    );

    return result.rows[0];
  };

  // UPDATE OPERATIONS

  updateUsernameById = async (
    username: string,
    userId: number
  ): Promise<void> => {
    await this.db.query<UserBlockList>(
      'UPDATE users SET username = $1 WHERE user_id = $2',
      [username, userId]
    );
  };

  updateProfilePictureById = async (
    fileName: string,
    userId: number
  ): Promise<void> => {
    await this.db.query<UserBlockList>(
      'UPDATE users SET profile_picture = $1 WHERE user_id = $2',
      [fileName, userId]
    );
  };

  updateBlockedUsersById = async (
    blockedUsers: number[],
    userId: number
  ): Promise<void> => {
    await this.db.query<UserBlockList>(
      'UPDATE users SET blocked_users = $1 WHERE user_id = $2',
      [blockedUsers, userId]
    );
  };
}
