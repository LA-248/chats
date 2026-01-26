import express, { NextFunction, Request, Response } from 'express';
import {
  addMembers,
  createGroupChat,
  leaveGroup,
  markGroupChatAsDeleted,
  permanentlyDeleteGroup,
  removeKickedGroupMember,
  retrieveGroupInfo,
  retrieveMemberUsernames,
  updateGroupPicture,
  updateLastMessageId,
  updateRole,
  updateUserReadStatus,
} from '../controllers/group.controller.ts';
import {
  authoriseGroupOwnerAction,
  authoriseGroupOwnerOrAdminAction,
  groupChatRoomAuth,
  requireAuth,
} from '../middlewares/auth.middleware.ts';
import handleMulterError from '../middlewares/multer.middleware.ts';
import { validate } from '../middlewares/validation.middleware.ts';
import {
  AddGroupMembersSchema,
  CreateGroupChatSchema,
  GroupIdSchema,
  GroupRoomSchema,
  PermanentlyDeleteGroupParamsSchema,
  RemoveKickedGroupMemberParamsSchema,
  UpdateGroupPictureParamsSchema,
  UpdateLastMessageIdBodySchema,
  UpdateLastMessageIdParamsSchema,
  UpdateMemberRoleBodySchema,
  UpdateMemberRoleParamsSchema,
} from '../schemas/group.schema.ts';
import { s3GroupPictureUpload } from '../services/s3.service.ts';

const groupChatsRouter = express.Router();
groupChatsRouter.use(requireAuth);

// TODO: Rename :groupId route parameter to :id

groupChatsRouter.post(
  '/',
  validate({ body: CreateGroupChatSchema }),
  createGroupChat,
);
groupChatsRouter.post(
  '/:room/members',
  groupChatRoomAuth,
  validate({ body: AddGroupMembersSchema }),
  addMembers,
);
groupChatsRouter.post(
  '/:groupId/pictures',
  groupChatRoomAuth,
  validate({ params: UpdateGroupPictureParamsSchema }),
  (req: Request, res: Response, next: NextFunction) => {
    s3GroupPictureUpload.single('group-picture')(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  },
  updateGroupPicture,
);

groupChatsRouter.get(
  '/:room',
  groupChatRoomAuth,
  validate({ params: GroupRoomSchema }),
  retrieveGroupInfo,
);
// FIXME: Group chat auth middleware doesn't work for this route because the group ID is used instead of the room for retrieval of data
groupChatsRouter.get(
  '/:groupId/members',
  validate({ params: GroupIdSchema }),
  retrieveMemberUsernames,
);

groupChatsRouter.delete(
  '/:groupId/members/me',
  groupChatRoomAuth,
  validate({ params: GroupIdSchema }),
  leaveGroup,
);
groupChatsRouter.delete(
  '/:groupId/members/:userId',
  groupChatRoomAuth,
  authoriseGroupOwnerOrAdminAction,
  validate({ params: PermanentlyDeleteGroupParamsSchema }),
  removeKickedGroupMember,
);
groupChatsRouter.delete(
  '/:groupId',
  groupChatRoomAuth,
  authoriseGroupOwnerAction,
  validate({ params: RemoveKickedGroupMemberParamsSchema }),
  permanentlyDeleteGroup,
);
groupChatsRouter.delete(
  '/:groupId/rooms/:room',
  groupChatRoomAuth,
  validate({ params: GroupRoomSchema }),
  markGroupChatAsDeleted,
);

groupChatsRouter.put(
  '/:room/last_message',
  groupChatRoomAuth,
  validate({
    body: UpdateLastMessageIdBodySchema,
    params: UpdateLastMessageIdParamsSchema,
  }),
  updateLastMessageId,
);
groupChatsRouter.put(
  '/:groupId/members/:userId',
  groupChatRoomAuth,
  authoriseGroupOwnerAction,
  validate({
    body: UpdateMemberRoleBodySchema,
    params: UpdateMemberRoleParamsSchema,
  }),
  updateRole,
);
groupChatsRouter.put('/:room', groupChatRoomAuth, updateUserReadStatus);

export default groupChatsRouter;
