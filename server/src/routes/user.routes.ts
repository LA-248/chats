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
import {
  RetrieveIdByUsernameParamsSchema,
  RetrieveUserProfilePictureParamsSchema,
  UpdateBlockedUsersBodySchema,
  UpdateUsernameParamsSchema,
  UploadProfilePictureParamsSchema,
  UserDataAuthSchema,
} from '../schemas/user.schema.ts';
import { s3UserPictureUpload } from '../services/s3.service.ts';

const usersRouter = express.Router();
usersRouter.use(requireAuth);

usersRouter.get(
  '/',
  validate({ user: UserDataAuthSchema }),
  retrieveLoggedInUserData,
);
usersRouter.get(
  '/blocked',
  validate({ user: UserDataAuthSchema }),
  retrieveBlockListById,
);
usersRouter.get(
  '/:username',
  validate({ params: RetrieveIdByUsernameParamsSchema }),
  retrieveIdByUsername,
);
usersRouter.get(
  '/:id/pictures',
  validate({ params: RetrieveUserProfilePictureParamsSchema }),
  retrieveUserProfilePicture,
);

// TODO: For these PUT routes, why not have the client send the user id as a request parameter? Instead of fetching it from the user session
usersRouter.put(
  '/',
  validate({ user: UserDataAuthSchema, body: UpdateUsernameParamsSchema }),
  updateUsername,
);
usersRouter.put(
  '/blocked',
  validate({ body: UpdateBlockedUsersBodySchema, user: UserDataAuthSchema }),
  updateBlockedUsers,
);

usersRouter.post(
  '/:id/pictures',
  validate({ params: UploadProfilePictureParamsSchema }),
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
