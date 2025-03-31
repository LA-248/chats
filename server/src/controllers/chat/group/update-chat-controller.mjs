import { GroupMember } from '../../../models/group-member-model.mjs';
import { Group } from '../../../models/group-model.mjs';
import { deleteS3Object } from '../../../services/s3/s3-file-handler.mjs';
import { createPresignedUrl } from '../../../services/s3/s3-presigned-url.mjs';

const addMembers = async (req, res) => {
	try {
		const addedMembers = req.body.addedMembers;
		const room = req.params.room;
		const groupInfo = await Group.retrieveGroupInfoByRoom(room);

		// Add members to the group chat
		const insertGroupMembers = addedMembers.map((user) =>
			GroupMember.insertGroupMember(groupInfo.group_id, user.userId, user.role)
		);
		await Promise.all(insertGroupMembers);

		return res.status(200).json({
			message: 'Members added',
		});
	} catch (error) {
		console.error('Error adding members to group chat:', error);
		return res
			.status(500)
			.json({ error: 'Error adding members. Please try again.' });
	}
};

const uploadPicture = async (req, res) => {
	try {
		const io = req.app.get('io');
		const room = req.params.room;

		// Delete previous picture from S3 storage
		const fileName = await Group.retrievePicture(room);
		if (!(fileName === null)) {
			// Only run if a picture exists
			await deleteS3Object(process.env.BUCKET_NAME, fileName);
		}

		// Upload new picture
		await Group.updatePicture(req.file.key, room);

		// Generate a temporary URL for viewing the uploaded picture from S3
		const presignedS3Url = await createPresignedUrl(
			process.env.BUCKET_NAME,
			req.file.key
		);

		await updateGroupPicture(io, room, presignedS3Url);

		return res
			.status(200)
			.json({ message: 'Group picture successfully updated' });
	} catch (error) {
		console.error('Error uploading group picture:', error);
		if (res) {
			return res
				.status(500)
				.json({ error: 'Error uploading picture. Please try again.' });
		}
	}
};

const updateUserReadStatus = async (req, res) => {
	try {
		const userId = req.user.user_id;
		const room = req.params.room;

		await Group.markUserAsRead(userId, room);
		return res.sendStatus(200);
	} catch (error) {
		console.error('Error adding group member to read list:', error);
		return res.status(500).json({ error: 'An unexpected error occurred' });
	}
};

// Update the last message id for a group chat, used when last message is deleted
const updateLastMessageId = async (req, res) => {
	try {
		const newLastMessageId = req.body.messageId;
		const room = req.params.room;

		await Group.updateLastMessage(newLastMessageId, room);
		return res
			.status(200)
			.json({ success: 'Last message successfully updated' });
	} catch (error) {
		console.error('Error updating last message id:', error);
		return res.status(500).json({
			error:
				'There was an error updating your chat list. Please refresh the page.',
		});
	}
};

// Update the picture of a group for all its members in real-time
const updateGroupPicture = async (io, room, groupPicture) => {
	io.to(room).emit('update-group-picture', {
		groupPicture,
		room,
	});
};

export {
	addMembers,
	uploadPicture,
	updateUserReadStatus,
	updateLastMessageId,
	updateGroupPicture,
};
