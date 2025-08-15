import { z } from 'zod/v4';

export const InsertMessageSchema = z.object({
  content: z.string(),
  senderId: z.number().int().positive(),
  recipientId: z.number().int().positive().nullable(),
  room: z.uuid(),
  type: z.string(),
  clientOffset: z.string(),
});
export type InsertMessage = z.infer<typeof InsertMessageSchema>;

export const NewMessageSchema = z.object({
  id: z.number(),
  event_time: z.coerce.date(),
});
export type NewMessage = z.infer<typeof NewMessageSchema>;

export const MessageSchema = z.object({
  message_id: z.number(),
  sender_id: z.number(),
  content: z.string(),
  event_time: z.coerce.date(),
  is_edited: z.boolean(),
  type: z.string(),
  sender_username: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;

export const FormattedMessageSchema = z.object({
  from: z.string(),
  content: z.string(),
  eventTime: z.coerce.date(),
  id: z.number(),
  senderId: z.number().int().positive(),
  isEdited: z.boolean(),
  type: z.string(),
});
export type FormattedMessage = z.infer<typeof FormattedMessageSchema>;

export const LastMessageInfoSchema = z.object({
  content: z.string(),
  event_time: z.coerce.date(),
});
export type LastMessageInfo = z.infer<typeof LastMessageInfoSchema>;
