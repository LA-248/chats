import express from 'express';
import {
	groupChatRoomAuth,
	requireAuth,
} from '../middlewares/auth-middleware.mjs';
import { createGroupChat } from '../controllers/chat/group/create-chat-controller.mjs';
import { retrieveGroupInfo } from '../controllers/chat/group/get-chat-controller.mjs';
import { deleteGroupChat } from '../controllers/chat/group/delete-chat-controller.mjs';

const groupChatsRouter = express.Router();
groupChatsRouter.use(requireAuth);

groupChatsRouter.post('/', createGroupChat);
groupChatsRouter.get('/:room', groupChatRoomAuth, retrieveGroupInfo);
groupChatsRouter.delete('/:room', groupChatRoomAuth, deleteGroupChat);

export default groupChatsRouter;
