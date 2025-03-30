import express from 'express';
import { s3Upload } from '../services/s3/s3-file-handler.mjs';
import { requireAuth } from '../middlewares/auth-middleware.mjs';
import handleMulterError from '../middlewares/multer-error-handler.mjs';
import {
	retrieveBlockListById,
	retrieveIdByUsername,
	retrieveLoggedInUserDataById,
} from '../controllers/user/get-user-controller.mjs';
import {
	updateBlockedUsers,
	updateUsernameById,
	uploadProfilePicture,
} from '../controllers/user/update-user-controller.mjs';

const usersRouter = express.Router();
usersRouter.use(requireAuth);

usersRouter.get('/', retrieveLoggedInUserDataById);
usersRouter.get('/blocked', retrieveBlockListById);
usersRouter.get('/:username', retrieveIdByUsername);

usersRouter.put('/', updateUsernameById);
usersRouter.put('/blocked', updateBlockedUsers);

usersRouter.post(
	'/picture',
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

export default usersRouter;
