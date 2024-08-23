import express from 'express';
import { retrieveIdByUsername, retrieveUsernameById, retrieveUserIdFromSession } from '../controllers/user/retrieve-user-info-controller.mjs';

const usersRouter = express.Router();

usersRouter.get('/username', retrieveUsernameById);
usersRouter.get('/id', retrieveUserIdFromSession);
usersRouter.post('/recipient_id', retrieveIdByUsername);

export default usersRouter;
