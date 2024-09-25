import express from 'express';
import handleMulterError from '../middlewares/multer-error-handler.mjs';
import { retrieveUserById , retrieveIdByUsername, retrieveUserIdFromSession, retrieveProfilePictureById, retrieveBlockListById } from '../controllers/user/retrieve-user-info-controller.mjs';
import { updateBlockedUsers, updateUsernameById, uploadProfilePicture } from '../controllers/user/update-user-info-controller.mjs';
import { s3Upload } from '../services/s3-file-handler.mjs';

const usersRouter = express.Router();

usersRouter.put('/', updateUsernameById);
usersRouter.get('/', retrieveUserById);
usersRouter.get('/id', retrieveUserIdFromSession);
usersRouter.post('/recipient_id', retrieveIdByUsername);

usersRouter.get('/profile_pictures', retrieveProfilePictureById);
usersRouter.post('/profile_pictures', 
  (req, res, next) => {
    s3Upload.single('profile-picture')(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  },
  uploadProfilePicture
);

usersRouter.get('/block', retrieveBlockListById);
usersRouter.put('/block', updateBlockedUsers);

export default usersRouter;
