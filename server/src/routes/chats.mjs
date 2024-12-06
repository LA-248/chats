import express from 'express';
import {
  addChat,
  retrieveChatList,
  deleteChat,
} from '../controllers/chat/chat-list-controller.mjs';

const chatsRouter = express.Router();

chatsRouter.post('/', addChat);
chatsRouter.get('/', retrieveChatList);
chatsRouter.delete('/', deleteChat);

export default chatsRouter;
