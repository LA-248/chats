import { z } from 'zod/v4';
import {
  CreatePrivateChatSchema,
  UpdateLastMessageIdBodySchema,
} from '../schemas/private-chat.schema.ts';

export type CreatePrivateChatInputDto = z.infer<typeof CreatePrivateChatSchema>;

export type UpdateLastMessageIdInputDto = z.infer<
  typeof UpdateLastMessageIdBodySchema
>;
