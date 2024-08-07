import express from 'express';
import { retrieveIdByUsername, retrieveUsernameById, retrieveUserIdFromSession } from '../controllers/user/retrieve-user-info-controller.mjs';
import { handleChatList } from '../controllers/user/chat-list-controller.mjs';

const usersRouter = express.Router();

usersRouter.get('/username', retrieveUsernameById);
usersRouter.get('/id', retrieveUserIdFromSession);
usersRouter.post('/chat_list', handleChatList);
usersRouter.post('/recipient_id', retrieveIdByUsername);

export default usersRouter;
