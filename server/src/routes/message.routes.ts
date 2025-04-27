import express from 'express';
import { requireAuth } from '../middlewares/auth.middleware.ts';
import {
  deleteMessageById,
  editMessageById,
} from '../controllers/message/message.controller.ts';

const messagesRouter = express.Router();
messagesRouter.use(requireAuth);

messagesRouter.put('/', editMessageById);
messagesRouter.delete('/', deleteMessageById);

export default messagesRouter;
