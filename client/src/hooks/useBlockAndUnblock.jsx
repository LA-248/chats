import { getBlockList } from '../api/user-api';

export default function useBlockAndUnblock({
	activeChat,
	updateBlockList,
	setIsBlocked,
	setErrorMessage,
}) {
	const handleBlockAndUnblock = async () => {
		try {
			const currentUserBlockList = await getBlockList();
			const recipientUserId = activeChat.userId;

			if (!currentUserBlockList.includes(recipientUserId)) {
				// Block user
				const updatedBlockList = [...currentUserBlockList, recipientUserId];
				await updateBlockList(updatedBlockList);
				setIsBlocked(true);
			} else {
				// Unblock user
				const updatedBlockList = currentUserBlockList.filter(
					(id) => id !== recipientUserId
				);
				await updateBlockList(updatedBlockList);
				setIsBlocked(false);
			}
		} catch (error) {
			setErrorMessage(error.message);
		}
	};

	return { handleBlockAndUnblock };
}
