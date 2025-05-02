import express, { NextFunction, Request, Response } from 'express';
import { s3Upload } from '../services/s3.service.ts';
import { requireAuth } from '../middlewares/auth.middleware.ts';
import handleMulterError from '../middlewares/multer.middleware.ts';
import {
  retrieveBlockListById,
  retrieveIdByUsername,
  retrieveLoggedInUserData,
  updateBlockedUsers,
  updateUsername,
  uploadProfilePicture,
} from '../controllers/user.controller.ts';

const usersRouter = express.Router();
usersRouter.use(requireAuth);

usersRouter.get('/', retrieveLoggedInUserData);
usersRouter.get('/blocked', retrieveBlockListById);
usersRouter.get('/:username', retrieveIdByUsername);

usersRouter.put('/', updateUsername);
usersRouter.put('/blocked', updateBlockedUsers);

usersRouter.post(
  '/picture',
  (req: Request, res: Response, next: NextFunction) => {
    s3Upload.single('profile-picture')(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  },
  uploadProfilePicture
);

export default usersRouter;
