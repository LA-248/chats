import express, { NextFunction, Request, Response } from 'express';
import handleMulterError from '../middlewares/multer.middleware.ts';
import {
  groupChatRoomAuth,
  groupMemberRemovalAuth,
  requireAuth,
} from '../middlewares/auth.middleware.ts';
import {
  addMembers,
  createGroupChat,
  leaveGroup,
  markGroupChatAsDeleted,
  removeGroupMember,
  retrieveGroupInfo,
  retrieveMemberUsernames,
  updateGroupPicture,
  updateLastMessageId,
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

groupChatsRouter.delete(
  '/:groupId/:userId',
  groupChatRoomAuth,
  groupMemberRemovalAuth,
  removeGroupMember
);
groupChatsRouter.delete('/:groupId', groupChatRoomAuth, leaveGroup);
groupChatsRouter.delete('/:room', groupChatRoomAuth, markGroupChatAsDeleted);

groupChatsRouter.put('/:room', groupChatRoomAuth, updateUserReadStatus);
groupChatsRouter.put(
  '/:room/last_message',
  groupChatRoomAuth,
  updateLastMessageId
);

export default groupChatsRouter;
