import express from 'express';
import {
  addChat,
  deleteChat,
  getChatList,
  updateChatReadStatus,
  updateLastMessageId,
} from '../controllers/private-chat.controller.ts';
import { retrieveRecipientProfile } from '../controllers/user.controller.ts';
import {
  privateChatRoomAuth,
  requireAuth,
} from '../middlewares/auth.middleware.ts';
import { validate } from '../middlewares/validation.middleware.ts';
import {
  CreatePrivateChatSchema,
  DeleteChatParamsSchema,
  UpdateLastMessageIdBodySchema,
  UpdateLastMessageIdParamsSchema,
  UpdateReadStatusBodySchema,
  UpdateReadStatusParamsSchema,
} from '../schemas/private-chat.schema.ts';

const privateChatsRouter = express.Router();
privateChatsRouter.use(requireAuth);

privateChatsRouter.post(
  '/',
  validate({ body: CreatePrivateChatSchema }),
  addChat,
);
privateChatsRouter.get('/', getChatList);
privateChatsRouter.get('/:room', privateChatRoomAuth, retrieveRecipientProfile);
privateChatsRouter.put(
  '/:room/last_message',
  privateChatRoomAuth,
  validate({
    body: UpdateLastMessageIdBodySchema,
    params: UpdateLastMessageIdParamsSchema,
  }),
  updateLastMessageId,
);
privateChatsRouter.put(
  '/:room/read_status',
  privateChatRoomAuth,
  validate({
    body: UpdateReadStatusBodySchema,
    params: UpdateReadStatusParamsSchema,
  }),
  updateChatReadStatus,
);
privateChatsRouter.delete(
  '/:room',
  validate({ params: DeleteChatParamsSchema }),
  deleteChat,
);

export default privateChatsRouter;
