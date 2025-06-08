import { useEffect } from 'react';

export default function useRemoveGroupChat(
  socket,
  setChatList,
  setActiveChatRoom,
  navigate
) {
  // Remove a group chat that a user left or was kicked out of from their chat list
  useEffect(() => {
    if (!socket) return;

    const handleGroupChatRemoval = (data) => {
      setChatList((prevChatList) =>
        prevChatList.filter((group) => group.room !== data.room)
      );
      setActiveChatRoom(null);
      navigate(data.redirectPath);
    };

    socket.on('remove-group-chat', handleGroupChatRemoval);

    return () => {
      socket.off('remove-group-chat', handleGroupChatRemoval);
    };
  }, [socket, setChatList, navigate, setActiveChatRoom]);
}
