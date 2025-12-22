import { z } from 'zod/v4';

export const CreateGroupChatSchema = z.object({
  ownerUserId: z.number().int().positive(),
  name: z.string().min(1).max(50),
  membersToBeAdded: z.array(
    z.object({
      username: z.string(),
      userId: z.number(),
      role: z.string(),
    })
  ),
});

export const NewGroupChatSchema = z.object({
  group_id: z.number(),
  room: z.uuid(),
  name: z.string(),
});
export type NewGroupChat = z.infer<typeof NewGroupChatSchema>;

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

export const GroupUpdatedAtSchema = z.object({ updated_at: z.coerce.date() });
export type GroupUpdatedAt = z.infer<typeof GroupUpdatedAtSchema>;

export const NewGroupMemberSchema = z.object({
  group_id: z.number(),
  user_id: z.number(),
  role: z.enum(['owner', 'admin', 'member']),
  joined_at: z.date(),
});
export type NewGroupMember = z.infer<typeof NewGroupMemberSchema>;

export const GroupMemberInfoSchema = z.object({
  user_id: z.number(),
  username: z.string(),
  profile_picture: z.string().nullable(),
  role: z.enum(['owner', 'admin', 'member']),
});

export const AddGroupMembersSchema = z.object({
  addedMembers: z.array(
    z.object({
      userId: z.number(),
      username: z.string(),
      role: z.enum(['owner', 'admin', 'member']),
    })
  ),
});

export const GroupIdSchema = z.string();

export const RemoveKickedGroupMemberParamsSchema = z.object({
  groupId: z.coerce.number().int().positive(),
  targetUserId: z.coerce.number().int().positive(),
});

export const UpdateMemberRoleBodySchema = z.object({
  newRole: z.enum(['owner', 'admin', 'member']),
});
export const UpdateMemberRoleParamsSchema = z.object({
  groupId: z.coerce.number().int().positive(),
  userId: z.coerce.number().int().positive(),
});

export const PermanentlyDeleteGroupParamsSchema = z.object({
  groupId: z.coerce.number().int().positive(),
});

export const UpdateGroupPictureParamsSchema = z.object({
  groupId: z.coerce.number().int().positive(),
});

export const UpdateUserReadStatusParamsSchema = z.object({
  room: z.string(),
});

export const UpdateLastMessageIdBodySchema = z.object({
  messageId: z.number().nullable(),
});
export const UpdateLastMessageIdParamsSchema = z.object({
  room: z.string(),
});
