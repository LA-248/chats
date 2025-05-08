import { z } from 'zod';

// Schema validations for database operations on the group and group member table

// Group table
export const InsertGroupChatSchema = z.object({
  ownerUserId: z.number().int().positive(),
  name: z.string().min(2).max(30),
  room: z.string().uuid(),
});
export type InsertGroupChat = z.infer<typeof InsertGroupChatSchema>;

export const NewGroupChatSchema = z.object({
  group_id: z.number(),
  room: z.string().uuid(),
  name: z.string(),
});
export type NewGroupChat = z.infer<typeof NewGroupChatSchema>;

export const GroupMemberInfoSchema = z.object({
  user_id: z.number(),
  username: z.string(),
  profile_picture: z.string().nullable(),
  role: z.string(),
});
export type GroupMemberInfo = z.infer<typeof GroupMemberInfoSchema>;

export const GroupInfoSchema = z.object({
  group_id: z.number(),
  name: z.string(),
  group_picture: z.string().nullable(),
});
export type GroupInfo = z.infer<typeof GroupInfoSchema>;

export const GroupRoomSchema = z.object({
  room: z.string().uuid(),
});
export type GroupRoom = z.infer<typeof GroupRoomSchema>;

export const GroupPictureSchema = z.string().nullable().or(z.null());
export type GroupPicture = z.infer<typeof GroupPictureSchema>;

export const GroupDeletedForListSchema = z.string().nullable().or(z.null());
export type GroupDeletedForList = z.infer<typeof GroupDeletedForListSchema>;

// Group member table
export const NewGroupMemberSchema = z.object({
  group_id: z.number(),
  user_id: z.number(),
  role: z.string(),
  joined_at: z.date(),
});
export type NewGroupMember = z.infer<typeof NewGroupMemberSchema>;

export const GroupMembersSchema = z.object({
  user_id: z.number(),
});
export type GroupMembers = z.infer<typeof GroupMembersSchema>;

export const RemovedGroupMemberSchema = z.number();
export type RemovedGroupMember = z.infer<typeof RemovedGroupMemberSchema>;
