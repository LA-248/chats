import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { GroupMember } from '../../../types/group';

export default function useMembersListUpdate(
  socket: Socket,
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

    socket.on('remove-member', handleMemberRemoval);
    socket.on('add-members', handleMemberAddition);

    return () => {
      socket.off('remove-member', handleMemberRemoval);
      socket.off('add-members', handleMemberAddition);
    };
  }, [socket, setMembersList]);
}
