import express from 'express';
import {
	groupChatRoomAuth,
	requireAuth,
} from '../middlewares/auth-middleware.mjs';
import { createGroupChat } from '../controllers/chat/group/create-chat-controller.mjs';
import {
	retrieveGroupInfo,
	retrieveMemberUsernames,
} from '../controllers/chat/group/get-chat-controller.mjs';
import {
	deleteGroupChat,
	removeGroupMember,
} from '../controllers/chat/group/delete-chat-controller.mjs';
import {
	addMembers,
	updateLastMessageId,
	updateUserReadStatus,
} from '../controllers/chat/group/update-chat-controller.mjs';

const groupChatsRouter = express.Router();
groupChatsRouter.use(requireAuth);

groupChatsRouter.post('/', createGroupChat);
groupChatsRouter.post('/:room/members', groupChatRoomAuth, addMembers);
groupChatsRouter.get('/:room', groupChatRoomAuth, retrieveGroupInfo);
// FIXME: Group chat auth middleware doesn't work for this route because the group ID is used instead of the room for retrieval of data
groupChatsRouter.get('/:groupId/members', retrieveMemberUsernames);
groupChatsRouter.delete('/:room', groupChatRoomAuth, deleteGroupChat);
// TODO: Add authorisation middleware to this route to ensure not anyone can remove a member from a group
groupChatsRouter.delete('/:groupId/:userId', removeGroupMember);
groupChatsRouter.put('/:room', groupChatRoomAuth, updateUserReadStatus);
groupChatsRouter.put(
	'/:room/last_message',
	groupChatRoomAuth,
	updateLastMessageId
);

export default groupChatsRouter;
