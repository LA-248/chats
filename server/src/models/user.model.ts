import { pool } from '../../db/index.ts';
import {
  InsertUserSchema,
  RecipientUserProfile,
  RecipientUserProfileSchema,
  User,
  UserBlockList,
  UserBlockListSchema,
  UserId,
  UserIdSchema,
  UserProfile,
  UserProfilePicture,
  UserProfilePictureSchema,
  UserProfileSchema,
  UserSchema,
} from '../schemas/user.schema.ts';

const User = {
  // CREATE OPERATIONS

  createUsersTable: function (): Promise<void> {
    return new Promise((resolve, reject) => {
      pool.query(
        `
          CREATE TABLE IF NOT EXISTS users (
            user_id SERIAL PRIMARY KEY,
            username VARCHAR(30) NOT NULL UNIQUE,
            hashed_password TEXT NOT NULL,
            profile_picture TEXT DEFAULT NULL,
            blocked_users INTEGER[] DEFAULT '{}'
          )
        `,
        (err) => {
          if (err) {
            return reject(
              new Error(`Database error in users table: ${err.message}`)
            );
          }
          return resolve();
        }
      );
    });
  },

  // INSERT OPERATIONS

  insertNewUser: function (
    username: string,
    hashedPassword: string
  ): Promise<void> {
    const parsed = InsertUserSchema.safeParse({
      username,
      hashedPassword,
    });

    if (!parsed.success) {
      console.error('Error validating new user data:', parsed.error);
      throw new Error('Error validating new user data');
    }

    return new Promise((resolve, reject) => {
      pool.query(
        `INSERT INTO users (username, hashed_password) VALUES ($1, $2)`,
        [username, hashedPassword],
        (err) => {
          if (err) {
            return reject(`Database error in users table: ${err.message}`);
          }
          return resolve();
        }
      );
    });
  },

  // UPDATE OPERATIONS

  updateUsernameById: function (
    username: string,
    userId: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      pool.query(
        `UPDATE users SET username = $1 WHERE user_id = $2`,
        [username, userId],
        (err) => {
          if (err) {
            return reject(`Database error in users table: ${err.message}`);
          }
          return resolve();
        }
      );
    });
  },

  updateProfilePictureById: function (
    fileName: string,
    userId: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      pool.query(
        `UPDATE users SET profile_picture = $1 WHERE user_id = $2`,
        [fileName, userId],
        (err) => {
          if (err) {
            return reject(`Database error in users table: ${err.message}`);
          }
          return resolve();
        }
      );
    });
  },

  updateBlockedUsersById: function (
    blockedUsers: number[],
    userId: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      pool.query(
        `UPDATE users SET blocked_users = $1 WHERE user_id = $2`,
        [blockedUsers, userId],
        (err) => {
          if (err) {
            return reject(`Database error in users table: ${err.message}`);
          }
          return resolve();
        }
      );
    });
  },

  // READ OPERATIONS

  getUserById: function (userId: number): Promise<UserProfile> {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT user_id, username, profile_picture FROM users WHERE user_id = $1`,
        [userId],
        (err, result) => {
          if (err) {
            return reject(`Database error in users table: ${err.message}`);
          }

          try {
            const userProfile = UserProfileSchema.parse(result.rows[0]);
            return resolve(userProfile);
          } catch (error) {
            return reject(
              `Error validating user profile data: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        }
      );
    });
  },

  getUserByUsername: function (username: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT * FROM users WHERE username = $1`,
        [username],
        (err, result) => {
          if (err) {
            return reject(`Database error in users table: ${err.message}`);
          }
          if (result.rows.length === 0) {
            return resolve(null);
          }

          try {
            const user = UserSchema.parse(result.rows[0]);
            return resolve(user);
          } catch (error) {
            return reject(
              `Error validating user data: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        }
      );
    });
  },

  getRecipientUserProfile: function (
    userId: number,
    room: string
  ): Promise<RecipientUserProfile | null> {
    return new Promise((resolve, reject) => {
      pool.query(
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
        (err, result) => {
          if (err) {
            return reject(`Database error in users table: ${err.message}`);
          }
          if (result.rows.length === 0) {
            return resolve(null);
          }

          try {
            const recipientUserProfile = RecipientUserProfileSchema.parse(
              result.rows[0]
            );
            return resolve(recipientUserProfile);
          } catch (error) {
            return reject(
              `Error validating recipient user profile data: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        }
      );
    });
  },

  getIdByUsername: function (username: string): Promise<UserId | null> {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT user_id FROM users WHERE username = $1`,
        [username],
        (err, result) => {
          if (err) {
            return reject(`Database error in users table: ${err.message}`);
          }
          if (result.rows.length === 0) {
            return resolve(null);
          }

          try {
            const id = UserIdSchema.parse(result.rows[0]);
            return resolve(id);
          } catch (error) {
            return reject(
              `Error validating user ID data: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        }
      );
    });
  },

  getUserProfilePicture: function (
    userId: number
  ): Promise<UserProfilePicture | null> {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT profile_picture FROM users WHERE user_id = $1`,
        [userId],
        (err, result) => {
          if (err) {
            return reject(`Database error in users table: ${err.message}`);
          }
          if (
            result.rows.length === 0 ||
            result.rows[0].profile_picture === null
          ) {
            return resolve(null);
          }

          try {
            const profilePicture = UserProfilePictureSchema.parse(
              result.rows[0].profile_picture
            );
            return resolve(profilePicture);
          } catch (error) {
            return reject(
              `Error validating user profile picture data: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        }
      );
    });
  },

  getBlockListById: function (userId: number): Promise<UserBlockList | null> {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT blocked_users FROM users WHERE user_id = $1`,
        [userId],
        (err, result) => {
          if (err) {
            return reject(`Database error in users table: ${err.message}`);
          }
          if (result.rows.length === 0) {
            return resolve(null);
          }

          try {
            const blockList = UserBlockListSchema.parse(
              result.rows[0].blocked_users
            );
            return resolve(blockList);
          } catch (error) {
            return reject(
              `Error validating user block list data: ${
                error instanceof Error ? error.message : error
              }`
            );
          }
        }
      );
    });
  },
};

export { User };
