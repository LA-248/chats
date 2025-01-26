import express from 'express';
import { requireAuth, roomAuth } from '../middlewares/auth-middleware.mjs';
import { retrieveRecipientProfile } from '../controllers/user/get-user-controller.mjs';

import { getChatList } from '../controllers/chat/direct/get-chat-controller.mjs';
import { addChat } from '../controllers/chat/direct/create-chat-controller.mjs';
import {
  deleteChat,
  updateChatReadStatus,
  updateLastMessageId,
} from '../controllers/chat/direct/update-chat-controller.mjs';

const privateChatsRouter = express.Router();
privateChatsRouter.use(requireAuth);

privateChatsRouter.post('/', addChat);
privateChatsRouter.get('/', getChatList);
privateChatsRouter.get('/:room', roomAuth, retrieveRecipientProfile);
privateChatsRouter.put('/:room/last_message', updateLastMessageId);
privateChatsRouter.put('/:room/read_status', roomAuth, updateChatReadStatus);
privateChatsRouter.delete('/:room', deleteChat);

export default privateChatsRouter;
