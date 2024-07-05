import { useContext, useEffect } from 'react';
import { MessageContext } from './MessageContext';
import { SocketContext } from '../pages/home';
import { useParams } from 'react-router-dom';

function ChatView() {
  const { messages, setMessages } = useContext(MessageContext);
  const socket = useContext(SocketContext);
  // Extract room from URL
  const { room } = useParams();

  useEffect(() => {
    const handleMessage = (messageData, serverOffset) => {
      // Concatenate new message to existing messages
      setMessages((prevMessages) => prevMessages.concat(messageData));
      if (serverOffset) {
        socket.auth.serverOffset = serverOffset;
      }
    };

    const handleInitialMessages = (initialMessages) => {
      setMessages(initialMessages);
    };

    // Join the room and request messages
    socket.emit('join-room', room);

    // Display all private chat messages on load
    socket.on('initial-messages', handleInitialMessages);

    // Listen for incoming messages from the server and update the messages list
    socket.on('chat-message', handleMessage);

    return () => {
      socket.off('initial-messages', handleInitialMessages);
      socket.off('chat-message', handleMessage);
    };
  }, [setMessages, socket, room]);

  return (
    <ul id="messages">
      {messages.map((messageData, index) => (
        <li key={index}>
          {messageData.from}: {messageData.message}
        </li>
      ))}
    </ul>
  );
}

export { ChatView };
