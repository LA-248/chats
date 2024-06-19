import express from 'express';
import { retrieveUsername } from '../controllers/user/retrieve-username-controller.mjs';
import { retrieveUserId } from '../controllers/user/retrieve-user-id-controller.mjs';

const usersRouter = express.Router();

usersRouter.get('/username', retrieveUsername);
usersRouter.get('/id', retrieveUserId);

export default usersRouter;
