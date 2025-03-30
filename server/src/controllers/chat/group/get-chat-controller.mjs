import { Group } from '../../../models/group-model.mjs';
import { createPresignedUrl } from '../../../services/s3/s3-presigned-url.mjs';

const retrieveGroupInfo = async (req, res) => {
	try {
		const room = req.params.room;
		const groupInfo = await Group.retrieveGroupInfoByRoom(room);
		const groupMembersInfo = await retrieveGroupMembersInfo(groupInfo.group_id);

		const groupPictureUrl = groupInfo.group_picture
			? await createPresignedUrl(
					process.env.BUCKET_NAME,
					groupInfo.group_picture
			  )
			: null;

		res.status(200).json({
			info: {
				chatId: groupInfo.group_id,
				name: groupInfo.name,
				groupPicture: groupPictureUrl,
			},
			membersInfo: groupMembersInfo,
		});
	} catch (error) {
		console.error('Error retrieving group info:', error);
		res.status(500).json({ error: 'An unexpected error occurred' });
	}
};

const retrieveGroupMembersInfo = async (groupId) => {
	try {
		const groupMembersInfo = await Group.retrieveMembersInfo(groupId);

		// Create a presigned S3 url for each group member's profile picture
		for (let i = 0; i < groupMembersInfo.length; i++) {
			const groupMember = groupMembersInfo[i];
			if (groupMember.profile_picture) {
				groupMember.profile_picture = await createPresignedUrl(
					process.env.BUCKET_NAME,
					groupMember.profile_picture
				);
			} else {
				groupMember.profile_picture = null;
			}
		}

		return groupMembersInfo;
	} catch (error) {
		throw error;
	}
};

const retrieveMemberUsernames = async (req, res) => {
	try {
		const groupId = req.params.groupId;
		const groupMembersInfo = await Group.retrieveMembersInfo(groupId);
		const memberUsernames = groupMembersInfo.map((member) => {
			return member.username;
		});
		res.status(200).json({ memberUsernames });
	} catch (error) {
		console.error('Error retrieving group member usernames:', error);
		res.status(500).json({ error: 'An unexpected error occurred' });
	}
};

export { retrieveGroupInfo, retrieveMemberUsernames };
