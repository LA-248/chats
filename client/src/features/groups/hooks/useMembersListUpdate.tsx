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

    const handleAdminAssignment = (data: {
      newAdmin: GroupMemberPartialInfo;
    }) => {
      setMembersList((prevMembersList) =>
        prevMembersList.map((member) => {
          if (member.user_id === data.newAdmin.user_id) {
            return { ...member, role: data.newAdmin.role };
          } else {
            return member;
          }
        })
      );
    };

    const handleGroupMemberProfilePictureUpdate = (data: {
      userId: number;
      newInfo: string;
      groupRoom: string;
    }) => {
      setMembersList((prevMembersList) =>
        prevMembersList.map((member) => {
          if (member.user_id === data.userId) {
            return { ...member, profile_picture: data.newInfo };
          } else {
            return member;
          }
        })
      );
    };

    const handleGroupMemberUsernameUpdate = (data: {
      userId: number;
      newInfo: string;
      groupRoom: string;
    }) => {
      setMembersList((prevMembersList) =>
        prevMembersList.map((member) => {
          if (member.user_id === data.userId) {
            return { ...member, username: data.newInfo };
          } else {
            return member;
          }
        })
      );
    };

    socket.on('remove-member', handleMemberRemoval);
    socket.on('add-members', handleMemberAddition);
    socket.on('assign-new-group-owner', handleNewGroupOwnerAssignment);
    socket.on('assign-member-as-admin', handleAdminAssignment);
    socket.on(
      'update-profile-picture-in-groups',
      handleGroupMemberProfilePictureUpdate
    );
    socket.on('update-username-in-groups', handleGroupMemberUsernameUpdate);

    return () => {
      socket.off('remove-member', handleMemberRemoval);
      socket.off('add-members', handleMemberAddition);
      socket.off('assign-new-group-owner', handleNewGroupOwnerAssignment);
      socket.off('assign-member-as-admin', handleAdminAssignment);
      socket.off(
        'update-profile-picture-in-groups',
        handleGroupMemberProfilePictureUpdate
      );
      socket.off('update-username-in-groups', handleGroupMemberUsernameUpdate);
    };
  }, [socket, setMembersList]);
}
