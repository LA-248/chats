import { useContext, useEffect } from 'react';
import { io } from 'https://cdn.socket.io/4.7.5/socket.io.esm.min.js';
import { MessageContext } from './message-context';

const socket = io('localhost:8080', {
  auth: {
    serverOffset: 0,
  },
  ackTimeout: 10000,
  retries: 3,
});

function MessageList() {
  const { setMessages } = useContext(MessageContext);

  useEffect(() => {
    // Listen for incoming messages from the server and update the messages list
    socket.on('chat message', (msg, serverOffset) => {
      setMessages((prevMessages) => prevMessages.concat(msg));
      socket.auth.serverOffset = serverOffset;
    });

    return () => {
      socket.off('chat message');
    };
  }, [setMessages]);
}

export { socket, MessageList };
