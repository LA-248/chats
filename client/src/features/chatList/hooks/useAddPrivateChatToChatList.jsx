import { useEffect } from 'react';

export default function useAddPrivateChatToChatList(socket, setChatList) {
  useEffect(() => {
    if (socket) {
      const handleChatAddition = (newChat) => {
        setChatList((prevChatList) => [newChat, ...prevChatList]);
      };

      socket.on('add-private-chat-to-chat-list', handleChatAddition);

      return () => {
        socket.off('add-private-chat-to-chat-list', handleChatAddition);
      };
    }
  }, [socket, setChatList]);
}
