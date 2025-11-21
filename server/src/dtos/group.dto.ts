import { z } from 'zod/v4';
import { CreateGroupChatSchema } from '../schemas/group.schema.ts';
import { GroupMemberInsertionResult } from '../types/group.ts';

export type CreateGroupChatInputDto = z.infer<typeof CreateGroupChatSchema>;

export type CreateGroupChatResponseDto = {
  group_id: number;
  room: string;
  name: string;
};

export type CreateGroupChatPartialSuccessResponseDto = {
  message: string;
  failedMembers: GroupMemberInsertionResult[];
};

export type CreateGroupChatBadRequestResponseDto = {
  error: string;
};
