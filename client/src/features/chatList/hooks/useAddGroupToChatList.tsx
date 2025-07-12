import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import type { Chat } from '../../../types/chat';

export default function useAddGroupToChatList(
  socket: Socket | null,
  setChatList: React.Dispatch<React.SetStateAction<Chat[]>>
) {
  useEffect(() => {
    if (socket) {
      const handleChatListUpdate = (newChat: Chat) => {
        setChatList((prevChatList) => [newChat, ...prevChatList]);
      };

      socket.on('add-group-to-chat-list', (data) => handleChatListUpdate(data));

      return () => {
        socket.off('add-group-to-chat-list', handleChatListUpdate);
      };
    }
  }, [socket, setChatList]);
}
