import express from 'express';
import { retrieveIdByUsername, retrieveUsernameById } from '../controllers/user/retrieve-username-controller.mjs';
import { retrieveUserId } from '../controllers/user/retrieve-user-id-controller.mjs';
import { handleChatList } from '../controllers/user/chat-list-controller.mjs';

const usersRouter = express.Router();

usersRouter.get('/username', retrieveUsernameById);
usersRouter.get('/id', retrieveUserId);
usersRouter.post('/chat_list', handleChatList);
usersRouter.post('/recipient_id', retrieveIdByUsername);

export default usersRouter;
