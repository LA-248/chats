import express from 'express';
import { retrieveUsername } from '../controllers/retrieve-username-controller.mjs';
import { retrieveUserId } from '../controllers/retrieve-user-id-controller.mjs';

const usersRouter = express.Router();

usersRouter.get('/username', retrieveUsername);
usersRouter.get('/id', retrieveUserId);

export default usersRouter;
