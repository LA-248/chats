import express from 'express';
import { requireAuth } from '../middlewares/auth.middleware.ts';
import {
  deleteMessage,
  editMessage,
} from '../controllers/message.controller.ts';

const messagesRouter = express.Router();
messagesRouter.use(requireAuth);

messagesRouter.put('/', editMessage);
messagesRouter.delete('/', deleteMessage);

export default messagesRouter;
