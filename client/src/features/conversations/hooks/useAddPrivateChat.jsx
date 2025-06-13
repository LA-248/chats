import { useEffect } from 'react';

export default function useAddPrivateChatToChatList(socket, setChatList) {
  useEffect(() => {
    if (socket) {
      const handleChatAddition = (chatList) => {
        setChatList(chatList);
      };
      socket.on('add-private-chat-to-chat-list', (data) =>
        handleChatAddition(data, 'add-private-chat-to-chat-list')
      );

      return () => {
        socket.off('add-private-chat-to-chat-list', handleChatAddition);
      };
    }
  }, [socket, setChatList]);
}
