import express from 'express';
import { retrieveUsername } from '../controllers/retrieve-username-controller.mjs';

const usersRouter = express.Router();

usersRouter.get('/username', retrieveUsername);

export default usersRouter;