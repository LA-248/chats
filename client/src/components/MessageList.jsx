import { useContext, useEffect } from 'react';
import { MessageContext } from './MessageContext';
import socket from '../utils/SocketConfig';

function MessageList() {
  const { messages, setMessages } = useContext(MessageContext);

  useEffect(() => {
    // Listen for incoming messages from the server and update the messages list
    socket.on('chat-message', (message, serverOffset) => {
      setMessages((prevMessages) => prevMessages.concat(message));
      socket.auth.serverOffset = serverOffset;
    });

    return () => {
      socket.off('chat-message');
    };
  }, [setMessages]);

  return (
    <ul id="messages">
      {messages.map((message, index) => (
        <li key={index}>{message}</li>
      ))}
    </ul>
  );
}

export { MessageList };
