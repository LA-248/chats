import express from 'express';
import {
  requireAuth,
  privateChatRoomAuth,
} from '../middlewares/auth.middleware.ts';
import {
  addChat,
  deleteChat,
  getChatList,
  updateChatReadStatus,
  updateLastMessageId,
} from '../controllers/private-chat.controller.ts';
import { retrieveRecipientProfile } from '../controllers/user.controller.ts';

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
