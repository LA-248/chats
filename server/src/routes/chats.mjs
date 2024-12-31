import express from 'express';
import { requireAuth } from '../middlewares/auth-middleware.mjs';
import { retrieveUserByUsername } from '../controllers/user/get-user-controller.mjs';
import { getChatList } from '../controllers/chat/get-chat-controller.mjs';
import { addChat } from '../controllers/chat/create-chat-controller.mjs';
import {
  deleteChat,
  updateChatReadStatus,
  updateLastMessageId,
} from '../controllers/chat/update-chat-controller.mjs';

const chatsRouter = express.Router();
chatsRouter.use(requireAuth);

chatsRouter.post('/', addChat);
chatsRouter.get('/', getChatList);
chatsRouter.get('/:room/:username', retrieveUserByUsername);
chatsRouter.put('/', updateLastMessageId);
chatsRouter.put('/:room/read_status', updateChatReadStatus);
chatsRouter.delete('/', deleteChat);

export default chatsRouter;
