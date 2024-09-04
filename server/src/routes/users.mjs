import express from 'express';
import { retrieveUserById , retrieveIdByUsername, retrieveUserIdFromSession, retrieveBlockList } from '../controllers/user/retrieve-user-info-controller.mjs';
import { updateBlockedUsers } from '../controllers/user/update-user-info-controller.mjs';

const usersRouter = express.Router();

usersRouter.get('/', retrieveUserById);
usersRouter.get('/id', retrieveUserIdFromSession);
usersRouter.post('/recipient_id', retrieveIdByUsername);

usersRouter.get('/block', retrieveBlockList);
usersRouter.put('/block', updateBlockedUsers);

export default usersRouter;
