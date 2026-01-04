import { z } from 'zod/v4';
import {
  CreatePrivateChatSchema,
  UpdateLastMessageIdBodySchema,
  UpdateReadStatusBodySchema,
} from '../schemas/private-chat.schema.ts';

export type CreatePrivateChatInputDto = z.infer<typeof CreatePrivateChatSchema>;

export type UpdateLastMessageIdInputDto = z.infer<
  typeof UpdateLastMessageIdBodySchema
>;

export type UpdateReadStatusInputDto = z.infer<
  typeof UpdateReadStatusBodySchema
>;
export type UpdateReadStatusResponseDto = {
  ok: boolean;
  success: string;
};

export type DeleteChatResponseDto = {
  message: string;
};
