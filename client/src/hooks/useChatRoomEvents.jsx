import { useEffect } from 'react';
import { useSocketErrorHandling } from './useSocketErrorHandling';

export const useChatRoomEvents = (socket, room, setMessages, setErrorMessage) => {
  useEffect(() => {
    const displayInitialMessages = (initialMessages) => {
      setMessages(initialMessages);
    };

    const handleChatListUpdate = (updatedMessageList) => {
      setMessages(updatedMessageList);
    };

    socket.emit('join-room', room);
    // Display all messages on load when opening a chat
    socket.on('initial-messages', displayInitialMessages);
    // Update chat message list for everyone in a room after a message is deleted
    socket.on('message-delete-event', handleChatListUpdate);

    return () => {
      socket.emit('leave-room', room);
      socket.off('initial-messages', displayInitialMessages);
      socket.off('message-delete-event', handleChatListUpdate);
    };
  }, [socket, room, setMessages, setErrorMessage]);

  useSocketErrorHandling(socket, setErrorMessage);
};
