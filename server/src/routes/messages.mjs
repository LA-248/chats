import express from 'express';
import {
  deleteMessageById,
  editMessageById,
  updateUsernameInMessages,
} from '../controllers/message/message-controller.mjs';

const messagesRouter = express.Router();

messagesRouter.put('/', editMessageById);
messagesRouter.put('/usernames', updateUsernameInMessages);
messagesRouter.delete('/', deleteMessageById);

export default messagesRouter;
