import { z } from 'zod/v4';

export const CreateGroupChatSchema = z.object({
  ownerUserId: z.number().int().positive(),
  name: z.string().min(1).max(50),
  room: z.uuid(),
  membersToBeAdded: z.array(
    z.object({
      username: z.string(),
      userId: z.number(),
      role: z.string(),
    })
  ),
});
export type CreateGroupChatDTOInput = z.infer<typeof CreateGroupChatSchema>;

export const NewGroupChatSchema = z.object({
  group_id: z.number(),
  room: z.uuid(),
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
  room: z.uuid(),
});
export type GroupRoom = z.infer<typeof GroupRoomSchema>;

export const GroupRoomsSchema = z.array(z.uuid());
export type GroupRooms = z.infer<typeof GroupRoomsSchema>;

export const GroupPictureSchema = z.object({
  group_picture: z.string().nullable().or(z.null()),
});
export type GroupPicture = z.infer<typeof GroupPictureSchema>;

export const GroupDeletedForListSchema = z.object({
  deleted_for: z.array(z.number()).nullable(),
});
export type GroupDeletedForList = z.infer<typeof GroupDeletedForListSchema>;

export const GroupUpdatedAtSchema = z.coerce.date();
export type GroupUpdatedAt = z.infer<typeof GroupUpdatedAtSchema>;

// Group member table
export const InsertGroupMemberSchema = z.object({
  groupId: z.number().int().positive(),
  userId: z.number().int().positive(),
  role: z.string(),
});
export type InsertGroupMember = z.infer<typeof InsertGroupMemberSchema>;

export const NewGroupMemberSchema = z.object({
  group_id: z.number(),
  user_id: z.number(),
  role: z.string(),
  joined_at: z.date(),
});
export type NewGroupMember = z.infer<typeof NewGroupMemberSchema>;

export const GroupMemberPartialInfoSchema = z.object({
  user_id: z.number(),
  role: z.string(),
});
export type GroupMemberPartialInfo = z.infer<
  typeof GroupMemberPartialInfoSchema
>;

export const RemovedGroupMemberSchema = z.object({
  user_id: z.number(),
  role: z.string(),
});
export type RemovedGroupMember = z.infer<typeof RemovedGroupMemberSchema>;
