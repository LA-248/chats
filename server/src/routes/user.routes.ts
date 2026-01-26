import express, { NextFunction, Request, Response } from 'express';
import {
  retrieveBlockListById,
  retrieveIdByUsername,
  retrieveLoggedInUserData,
  retrieveUserProfilePicture,
  updateBlockedUsers,
  updateUsername,
  uploadProfilePicture,
} from '../controllers/user.controller.ts';
import { requireAuth } from '../middlewares/auth.middleware.ts';
import handleMulterError from '../middlewares/multer.middleware.ts';
import { validate } from '../middlewares/validation.middleware.ts';
import { RetrieveLoggedInUserDataAuthSchema } from '../schemas/user.schema.ts';
import { s3UserPictureUpload } from '../services/s3.service.ts';

const usersRouter = express.Router();
usersRouter.use(requireAuth);

usersRouter.get(
  '/',
  validate({ user: RetrieveLoggedInUserDataAuthSchema }),
  retrieveLoggedInUserData,
);
usersRouter.get('/blocked', retrieveBlockListById);
usersRouter.get('/:username', retrieveIdByUsername);
usersRouter.get('/:id/pictures', retrieveUserProfilePicture);

usersRouter.put('/', updateUsername);
usersRouter.put('/blocked', updateBlockedUsers);

usersRouter.post(
  '/:id/pictures',
  (req: Request, res: Response, next: NextFunction) => {
    s3UserPictureUpload.single('profile-picture')(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  },
  uploadProfilePicture,
);

export default usersRouter;
