import express from 'express';
import { deleteMessageById } from '../controllers/message/message-controller.mjs';

const messagesRouter = express.Router();

messagesRouter.delete('/', deleteMessageById);

export default messagesRouter;
