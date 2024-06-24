import { useContext, useEffect } from 'react';
import { MessageContext } from './MessageContext';
import { SocketContext } from '../pages/home';

function MessageList() {
  const { messages, setMessages } = useContext(MessageContext);
  const socket = useContext(SocketContext);

  useEffect(() => {
    const handleMessage = (messageData, serverOffset) => {
      setMessages((prevMessages) => prevMessages.concat(messageData));
      socket.auth.serverOffset = serverOffset;
    };

    // Listen for incoming messages from the server and update the messages list
    socket.on('chat-message', handleMessage);

    return () => {
      socket.off('chat-message');
    };
  }, [setMessages, socket]);

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

export { MessageList };
