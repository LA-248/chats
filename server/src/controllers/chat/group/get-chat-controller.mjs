import { Group } from '../../../models/group-model.mjs';

const retrieveGroupInfo = async (req, res) => {
	try {
		const room = req.params.room;
		const groupInfo = await Group.retrieveGroupInfoByRoom(room);
		res.status(200).json({
			chatId: groupInfo.group_id,
			name: groupInfo.name,
			groupPicture: groupInfo.group_picture,
		});
	} catch (error) {
		console.error('Error retrieving group info:', error);
		res.status(500).json({ error: 'An unexpected error occurred' });
	}
};

export { retrieveGroupInfo };
