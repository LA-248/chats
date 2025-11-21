import { z } from 'zod/v4';
import { CreatePrivateChatSchema } from '../schemas/private-chat.schema.ts';

export type CreatePrivateChatInputDto = z.infer<typeof CreatePrivateChatSchema>;
