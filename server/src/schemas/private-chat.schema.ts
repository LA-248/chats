import { z } from 'zod/v4';
import { UsernameSchema } from './user.schema.ts';

export const CreatePrivateChatBodySchema = z.object({
  recipientName: UsernameSchema,
});

export const NewChatSchema = z.object({
  chat_id: z.number(),
  user1_id: z.number(),
  user2_id: z.number(),
  last_message_id: z.number().nullable(),
  room: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  user1_deleted_at: z.coerce.date(),
  user2_deleted_at: z.coerce.date(),
  user1_last_read_at: z.coerce.date(),
  user2_last_read_at: z.coerce.date(),
});
export type NewChat = z.infer<typeof NewChatSchema>;

export const ChatMembersSchema = z.object({
  user1_id: z.number(),
  user2_id: z.number(),
});
export type ChatMembers = z.infer<typeof ChatMembersSchema>;

export const ChatDeletionStatusSchema = z.object({
  deleted_at: z.coerce.date().nullable(),
});
export type ChatDeletionStatus = z.infer<typeof ChatDeletionStatusSchema>;

export const ChatUpdatedAtSchema = z.object({
  updated_at: z.coerce.date(),
});
export type ChatUpdatedAt = z.infer<typeof ChatUpdatedAtSchema>;

export const ChatLastMessageSchema = z.object({
  last_message_id: z.number().nullable(),
});
export type ChatLastMessage = z.infer<typeof ChatLastMessageSchema>;

export const UpdateLastMessageIdBodySchema = z.strictObject({
  messageId: z.coerce.number().int().positive().nullable(),
});

const RoomParamsSchema = z.strictObject({
  room: z.uuid(),
});

export const UpdateReadStatusParamsSchema = RoomParamsSchema;
export const UpdateLastMessageIdParamsSchema = RoomParamsSchema;
export const DeleteChatParamsSchema = RoomParamsSchema;
