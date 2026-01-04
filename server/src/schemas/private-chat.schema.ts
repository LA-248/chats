import { z } from 'zod/v4';
import { ChatType } from '../types/chat.ts';
import { UsernameSchema } from './user.schema.ts';

export const CreatePrivateChatSchema = z.object({
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
  user1_deleted: z.boolean(),
  user2_deleted: z.boolean(),
  user1_read: z.boolean(),
  user2_read: z.boolean(),
});
export type NewChat = z.infer<typeof NewChatSchema>;

export const ChatMembersSchema = z.object({
  user1_id: z.number(),
  user2_id: z.number(),
});
export type ChatMembers = z.infer<typeof ChatMembersSchema>;

export const ChatDeletionStatusSchema = z.object({
  deleted: z.boolean(),
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

// TODO: This schema applies to both private and group chats, so it should be moved to a different file
export const ChatSchema = z.object({
  chat_id: z.string(),
  recipient_user_id: z.number().nullable(),
  name: z.string(),
  chat_picture: z.string().nullable(),
  last_message_id: z.number().nullable(),
  last_message_content: z.string().nullable(),
  last_message_time: z.coerce.date().nullable(),
  last_message_type: z.enum(ChatType).nullable(),
  room: z.uuid(),
  read: z.boolean(),
  chat_type: z.enum(ChatType),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  deleted: z.boolean(),
});
export type Chat = z.infer<typeof ChatSchema>;

export const UpdateLastMessageIdBodySchema = z.strictObject({
  messageId: z.coerce.number().int().positive().nullable(),
});

export const UpdateReadStatusBodySchema = z.strictObject({
  read: z.boolean(),
});

const RoomParamsSchema = z.strictObject({
  room: z.uuid(),
});

export const UpdateReadStatusParamsSchema = RoomParamsSchema;
export const UpdateLastMessageIdParamsSchema = RoomParamsSchema;
export const DeleteChatParamsSchema = RoomParamsSchema;
