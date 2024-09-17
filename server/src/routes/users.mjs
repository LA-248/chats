import express from 'express';
import { retrieveUserById , retrieveIdByUsername, retrieveUserIdFromSession, retrieveBlockList, retrieveProfilePicture } from '../controllers/user/retrieve-user-info-controller.mjs';
import { updateBlockedUsers, updateUsernameById, uploadProfilePicture } from '../controllers/user/update-user-info-controller.mjs';
import { s3Upload } from '../services/s3-file-handler.mjs';

const usersRouter = express.Router();

usersRouter.put('/', updateUsernameById);
usersRouter.get('/', retrieveUserById);
usersRouter.get('/id', retrieveUserIdFromSession);
usersRouter.post('/recipient_id', retrieveIdByUsername);

usersRouter.get('/profile_pictures', retrieveProfilePicture);
usersRouter.post('/profile_pictures', s3Upload.single('profile-picture'), uploadProfilePicture);

usersRouter.get('/block', retrieveBlockList);
usersRouter.put('/block', updateBlockedUsers);

export default usersRouter;
