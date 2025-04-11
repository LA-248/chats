import { useEffect } from 'react';

export default function useMembersListUpdate(socket, setMembersList) {
  useEffect(() => {
    if (!socket) return;

    const handleMemberRemoval = (data) => {
      setMembersList((prevMembersList) =>
        prevMembersList.filter(
          (member) => member.user_id !== data.removedUserId
        )
      );
    };

    const handleMemberAddition = (data) => {
      console.log(data.addedUsers);
      setMembersList((prevMembersList) =>
        prevMembersList.concat(data.addedUsers)
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
