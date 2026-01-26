import { z } from 'zod/v4';

export const UpdateGroupMemberRoleSchema = z.object({
  role: z.string(),
});
