import express, { NextFunction, Request, Response } from 'express';
import {
  deleteMessage,
  editMessage,
  uploadMedia,
} from '../controllers/message.controller.ts';
import { requireAuth } from '../middlewares/auth.middleware.ts';
import {
  authoriseMessageDeletion,
  enforceMessageEditRules,
} from '../middlewares/message.middleware.ts';
import handleMulterError from '../middlewares/multer.middleware.ts';
import { validate } from '../middlewares/validation.middleware.ts';
import {
  EditMessageBodySchema,
  EditMessageParamsSchema,
} from '../schemas/message.schema.ts';
import { s3ChatMediaUpload } from '../services/s3.service.ts';

const messagesRouter = express.Router();
messagesRouter.use(requireAuth);

messagesRouter.put(
  '/:type/:chatId/messages/:messageId',
  validate({ body: EditMessageBodySchema, params: EditMessageParamsSchema }),
  enforceMessageEditRules,
  editMessage,
);
messagesRouter.delete(
  '/:type/:chatId/messages/:messageId',
  authoriseMessageDeletion,
  deleteMessage,
);
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
  uploadMedia,
);

export default messagesRouter;
