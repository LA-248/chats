import { useEffect } from 'react';
import { Chat } from '../../../types/chat';
import { Socket } from 'socket.io-client';

// Add private chat to the recipient's chat list in real-time on first time message
export default function useAddPrivateChatToChatList(
  socket: Socket,
  setChatList: React.Dispatch<React.SetStateAction<Chat[]>>
) {
  useEffect(() => {
    if (socket) {
      const handleChatAddition = (newChat: Chat): void => {
        setChatList((prevChatList): Chat[] => {
          // Only add chat if it does not already exist
          if (!prevChatList.some((chat) => chat.chat_id === newChat.chat_id)) {
            return [newChat, ...prevChatList];
          } else {
            return prevChatList;
          }
        });
      };

      socket.on('add-private-chat-to-chat-list', (data: Chat) =>
        handleChatAddition(data)
      );

      return () => {
        socket.off('add-private-chat-to-chat-list');
      };
    }
  }, [socket, setChatList]);
}
