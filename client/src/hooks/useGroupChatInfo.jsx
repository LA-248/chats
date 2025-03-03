import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGroupChatInfo } from '../api/group-chat-api';

export function useGroupChatInfo(room, chatType, setErrorMessage) {
	const navigate = useNavigate();
	const [groupMembersInfo, setGroupMembersInfo] = useState([]);

	useEffect(() => {
		const fetchGroupInfo = async () => {
			try {
				if (chatType === 'groups') {
					const groupChatInfo = await getGroupChatInfo(room, navigate);
					setGroupMembersInfo(groupChatInfo.membersInfo);
				}
			} catch (error) {
				setErrorMessage(error.message);
			}
		};

		fetchGroupInfo();
	}, [room, chatType, navigate, setErrorMessage]);

	return groupMembersInfo;
}
