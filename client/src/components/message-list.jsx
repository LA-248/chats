import { useContext, useEffect } from "react";
import { io } from 'https://cdn.socket.io/4.7.5/socket.io.esm.min.js';
import { MessageContext } from "./message-context";

const socket = io('localhost:8080');

function MessageList() {
  const { setMessages } = useContext(MessageContext);

  useEffect(() => {
    // Listen for incoming messages from the server and update the messages list
    socket.on('chat message', (msg) => {
      setMessages((prevMessages) => prevMessages.concat(msg));
    });

    return () => {
      socket.off('chat message');
    };
  }, [setMessages]);
}

export { socket, MessageList };
