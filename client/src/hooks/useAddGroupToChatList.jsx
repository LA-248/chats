import { useEffect } from 'react';

export default function useAddGroupToChatList(socket, setChatList) {
  useEffect(() => {
    if (socket) {
      const handleChatListUpdate = (newChat) => {
        setChatList((prevChatList) => [newChat, ...prevChatList]);
      };

      socket.on('add-group-to-chat-list', (data) =>
        handleChatListUpdate(data, 'add-group-to-chat-list')
      );

      return () => {
        socket.off('add-group-to-chat-list');
      };
    }
  }, [socket, setChatList]);
}
