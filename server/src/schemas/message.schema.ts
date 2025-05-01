import { z } from 'zod';

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
  sender_username: z.string(),
  profile_picture: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;

export const LastMessageInfoSchema = z.object({
  content: z.string(),
  event_time: z.coerce.date(),
});
export type LastMessageInfo = z.infer<typeof LastMessageInfoSchema>;

export const DeletedMessageSchema = z.object({
  message_id: z.number(),
  sender_id: z.number(),
  recipient_id: z.number(),
  client_offset: z.string(),
  room: z.string().uuid(),
  content: z.string(),
  event_time: z.coerce.date(),
  is_edited: z.boolean(),
});
export type DeletedMessage = z.infer<typeof DeletedMessageSchema>;
