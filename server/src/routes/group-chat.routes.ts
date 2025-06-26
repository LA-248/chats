import express, { NextFunction, Request, Response } from 'express';
import handleMulterError from '../middlewares/multer.middleware.ts';
import {
  authoriseGroupOwnerAction,
  authoriseGroupOwnerOrAdminAction,
  groupChatRoomAuth,
  requireAuth,
} from '../middlewares/auth.middleware.ts';
import {
  addMembers,
  createGroupChat,
  leaveGroup,
  markGroupChatAsDeleted,
  permanentlyDeleteGroup,
  removeGroupMember,
  retrieveGroupInfo,
  retrieveMemberUsernames,
  updateGroupPicture,
  updateLastMessageId,
  updateRoleToAdmin,
  updateUserReadStatus,
} from '../controllers/group.controller.ts';

import { s3Upload } from '../services/s3.service.ts';

const groupChatsRouter = express.Router();
groupChatsRouter.use(requireAuth);

groupChatsRouter.post('/', createGroupChat);
groupChatsRouter.post('/:room/members', groupChatRoomAuth, addMembers);
groupChatsRouter.post(
  '/:room/pictures',
  groupChatRoomAuth,
  (req: Request, res: Response, next: NextFunction) => {
    s3Upload.single('group-picture')(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  },
  updateGroupPicture
);

groupChatsRouter.get('/:room', groupChatRoomAuth, retrieveGroupInfo);
// FIXME: Group chat auth middleware doesn't work for this route because the group ID is used instead of the room for retrieval of data
groupChatsRouter.get('/:groupId/members', retrieveMemberUsernames);

groupChatsRouter.delete('/:groupId/members/me', groupChatRoomAuth, leaveGroup);
groupChatsRouter.delete(
  '/:groupId/members/:userId',
  groupChatRoomAuth,
  authoriseGroupOwnerOrAdminAction,
  removeGroupMember
);
groupChatsRouter.delete(
  '/:groupId',
  groupChatRoomAuth,
  authoriseGroupOwnerAction,
  permanentlyDeleteGroup
);
groupChatsRouter.delete(
  '/:groupId/rooms/:room',
  groupChatRoomAuth,
  markGroupChatAsDeleted
);

groupChatsRouter.put(
  '/:room/last_message',
  groupChatRoomAuth,
  updateLastMessageId
);
groupChatsRouter.put(
  '/:groupId/members/:userId',
  groupChatRoomAuth,
  updateRoleToAdmin
);
groupChatsRouter.put('/:room', groupChatRoomAuth, updateUserReadStatus);

export default groupChatsRouter;
