import express, { NextFunction, Request, Response } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.ts';
import { s3ChatMediaUpload } from '../services/s3.service.ts';
import {
  deleteMessage,
  editMessage,
  uploadMedia,
} from '../controllers/message.controller.ts';
import handleMulterError from '../middlewares/multer.middleware.ts';
import { enforceMessageEditRules } from '../middlewares/message.middleware.ts';

const messagesRouter = express.Router();
messagesRouter.use(requireAuth);

messagesRouter.put(
  '/:type/:chatId/messages/:messageId',
  enforceMessageEditRules,
  editMessage
);
messagesRouter.delete('/:type/:chatId/messages/:messageId', deleteMessage);
messagesRouter.post(
  '/:type/:chatId/media',
  (req: Request, res: Response, next: NextFunction) => {
    s3ChatMediaUpload.single('media-upload')(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  },
  uploadMedia
);

export default messagesRouter;
