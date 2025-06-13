import { useEffect } from 'react';

// Add private chat to the recipient's chat list in real-time on first time message
export default function useAddPrivateChatToChatList(socket, setChatList) {
  useEffect(() => {
    if (socket) {
      const handleChatAddition = (newChat) => {
        setChatList((prevChatList) => {
          if (!prevChatList.some((chat) => chat.chat_id === newChat.chat_id)) {
            return [newChat, ...prevChatList];
          } else {
            return [...prevChatList];
          }
        });
      };

      socket.on('add-private-chat-to-chat-list', (data) =>
        handleChatAddition(data, 'add-private-chat-to-chat-list')
      );

      return () => {
        socket.off('add-private-chat-to-chat-list');
      };
    }
  }, [socket, setChatList]);
}
