import express from 'express';
import { retrieveUserByUsername } from '../controllers/user/get-user-controller.mjs';
import { getChatList } from '../controllers/chat/get-chat-controller.mjs';
import { addChat } from '../controllers/chat/create-chat-controller.mjs';
import {
  deleteChat,
  updateChatReadStatus,
  updateLastMessageId,
} from '../controllers/chat/update-chat-controller.mjs';

const chatsRouter = express.Router();

chatsRouter.post('/', addChat);

chatsRouter.get('/', getChatList);
chatsRouter.get('/:room/:username', retrieveUserByUsername);

chatsRouter.put('/read_receipts', updateChatReadStatus);
chatsRouter.put('/last_messages', updateLastMessageId);

chatsRouter.delete('/', deleteChat);

export default chatsRouter;
