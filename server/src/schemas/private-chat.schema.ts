import { z } from 'zod/v4';

export const InsertPrivateChatSchema = z.object({
  user1Id: z.number().int().positive(),
  user2Id: z.number().int().positive(),
  room: z.uuid(),
});
export type InsertPrivateChat = z.infer<typeof InsertPrivateChatSchema>;

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

export const ChatRoomSchema = z.uuid();
export type ChatRoom = z.infer<typeof ChatRoomSchema>;

export const ChatDeletionStatusSchema = z.boolean();
export type ChatDeletionStatus = z.infer<typeof ChatDeletionStatusSchema>;

export const ChatUpdatedAtSchema = z.coerce.date();
export type ChatUpdatedAt = z.infer<typeof ChatUpdatedAtSchema>;

export const ChatLastMessageSchema = z.number().nullable();
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
  last_message_type: z.string().nullable(),
  room: z.string(),
  read: z.boolean(),
  chat_type: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  deleted: z.boolean(),
});
export type Chat = z.infer<typeof ChatSchema>;
