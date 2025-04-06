import { useEffect } from 'react';

export default function useMembersListUpdate(
	socket,
	groupMembers,
	setMembersList
) {
	useEffect(() => {
		if (!socket) return;

		const handleMembersListUpdate = (data) => {
			const updatedMembersList = groupMembers.filter(
				(member) => member.user_id !== data.removedUserId
			);
			setMembersList(updatedMembersList);
		};

		socket.on('update-members-list', handleMembersListUpdate);
		return () => socket.off('update-members-list', handleMembersListUpdate);
	}, [socket, groupMembers, setMembersList]);
}
