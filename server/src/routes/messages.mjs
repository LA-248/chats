import express from 'express';
import { requireAuth } from '../middlewares/auth-middleware.mjs';
import {
  deleteMessageById,
  editMessageById,
} from '../controllers/message/update-message-controller.mjs';

const messagesRouter = express.Router();
messagesRouter.use(requireAuth);

messagesRouter.put('/', editMessageById);
messagesRouter.delete('/', deleteMessageById);

export default messagesRouter;
