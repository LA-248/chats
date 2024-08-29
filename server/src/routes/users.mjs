import express from 'express';
import { retrieveUserById , retrieveIdByUsername, retrieveUserIdFromSession } from '../controllers/user/retrieve-user-info-controller.mjs';

const usersRouter = express.Router();

usersRouter.get('/', retrieveUserById);
usersRouter.get('/id', retrieveUserIdFromSession);
usersRouter.post('/recipient_id', retrieveIdByUsername);

export default usersRouter;
