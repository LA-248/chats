import express from 'express';
import { deleteMessageById, updateUsernameInMessages } from '../controllers/message/message-controller.mjs';

const messagesRouter = express.Router();

messagesRouter.put('/', updateUsernameInMessages);
messagesRouter.delete('/', deleteMessageById);

export default messagesRouter;
