import express from 'express';
import {
  requireAuth,
  privateChatRoomAuth,
} from '../middlewares/auth.middleware.ts';
import { retrieveRecipientProfile } from '../controllers/user/get-user.controller.ts';

import { getChatList } from '../controllers/chat/direct/get-chat.controller.ts';
import { addChat } from '../controllers/chat/direct/create-chat.controller.ts';
import {
  deleteChat,
  updateChatReadStatus,
  updateLastMessageId,
} from '../controllers/chat/direct/update-chat.controller.ts';

const privateChatsRouter = express.Router();
privateChatsRouter.use(requireAuth);

privateChatsRouter.post('/', addChat);
privateChatsRouter.get('/', getChatList);
privateChatsRouter.get('/:room', privateChatRoomAuth, retrieveRecipientProfile);
privateChatsRouter.put(
  '/:room/last_message',
  privateChatRoomAuth,
  updateLastMessageId
);
privateChatsRouter.put(
  '/:room/read_status',
  privateChatRoomAuth,
  updateChatReadStatus
);
privateChatsRouter.delete('/:room', deleteChat);

export default privateChatsRouter;
