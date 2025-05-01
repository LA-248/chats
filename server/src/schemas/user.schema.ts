import { z } from 'zod';

export const UserProfileSchema = z.object({
  user_id: z.number(),
  username: z.string(),
  profile_picture: z.string(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UserSchema = z.object({
  user_id: z.number(),
  username: z.string(),
  hashed_password: z.string(),
  profile_picture: z.string(),
  blocked_users: z.array(z.number()),
});
export type User = z.infer<typeof UserSchema>;

export const RecipientUserProfileSchema = z.object({
  user_id: z.number(),
  username: z.string(),
  profile_picture: z.string(),
  blocked_users: z.array(z.number()),
});
export type RecipientUserProfile = z.infer<typeof RecipientUserProfileSchema>;

export const UserIdSchema = z.object({
  user_id: z.number(),
});
export type UserId = z.infer<typeof UserIdSchema>;

export const UserProfilePictureSchema = z.string();
export type UserProfilePicture = z.infer<typeof UserProfilePictureSchema>;

export const UserBlockListSchema = z.array(z.number());
export type UserBlockList = z.infer<typeof UserBlockListSchema>;
