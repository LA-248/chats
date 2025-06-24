import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import type { GroupMember, GroupMemberPartialInfo } from '../../../types/group';

export default function useMembersListUpdate(
  socket: Socket | null,
  setMembersList: React.Dispatch<React.SetStateAction<GroupMember[]>>
) {
  useEffect(() => {
    if (!socket) return;

    const handleMemberRemoval = (data: { removedUserId: number }) => {
      setMembersList((prevMembersList) =>
        prevMembersList.filter(
          (member) => member.user_id !== data.removedUserId
        )
      );
    };

    const handleMemberAddition = (data: { addedUsersInfo: GroupMember[] }) => {
      setMembersList((prevMembersList) =>
        prevMembersList.concat(data.addedUsersInfo)
      );
    };

    const handleNewGroupOwnerAssignment = (data: {
      newGroupOwner: GroupMemberPartialInfo;
    }) => {
      setMembersList((prevMembersList) =>
        prevMembersList.map((member) => {
          if (member.user_id === data.newGroupOwner.user_id) {
            return { ...member, role: data.newGroupOwner.role };
          } else {
            return member;
          }
        })
      );
    };

    socket.on('remove-member', handleMemberRemoval);
    socket.on('add-members', handleMemberAddition);
    socket.on('assign-new-group-owner', handleNewGroupOwnerAssignment);

    return () => {
      socket.off('remove-member');
      socket.off('add-members');
      socket.off('assign-new-group-owner');
    };
  }, [socket, setMembersList]);
}
