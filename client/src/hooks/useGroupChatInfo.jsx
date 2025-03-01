import { useEffect, useState } from 'react';
import { getGroupChatInfo } from '../api/group-chat-api';

export function useGroupChatInfo(room, chatType, setErrorMessage) {
	const [groupMembersInfo, setGroupMembersInfo] = useState([]);

	useEffect(() => {
		const fetchGroupInfo = async () => {
			try {
				if (chatType === 'groups') {
					const groupChatInfo = await getGroupChatInfo(room);
					setGroupMembersInfo(groupChatInfo.membersInfo);
				}
			} catch (error) {
				setErrorMessage(error.message);
			}
		};

		fetchGroupInfo();
	}, [room, chatType, setErrorMessage]);

	return groupMembersInfo;
}
