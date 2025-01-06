import express from 'express';
import { requireAuth } from '../middlewares/auth-middleware.mjs';
import { createGroupChat } from '../controllers/chat/group/create-chat-controller.mjs';

const groupChatsRouter = express.Router();
groupChatsRouter.use(requireAuth);

groupChatsRouter.post('/', createGroupChat);

export default groupChatsRouter;
