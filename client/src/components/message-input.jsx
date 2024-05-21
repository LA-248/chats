import { useContext, useEffect, useState } from 'react';
import { MessageContext } from './message-context';
import { socket } from './message-list';

export default function MessageInput() {
  const { message, setMessage, messages, setMessages } = useContext(MessageContext);
  const [counter, setCounter] = useState(0);

  const submitChatMessage = (event) => {
    event.preventDefault();
    if (message) {
      // Compute a unique offset
      const clientOffset = `${socket.id}-${counter}`;
      setCounter(counter + 1);
      // Send the message to the server
      socket.emit('chat message', message, clientOffset);
      setMessage('');
    }
  };

  // Clear message list on socket disconnection
  useEffect(() => {
    const handleDisconnect = () => {
      if (socket.disconnected) {
        setMessages([]);
      }
    };
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('disconnect', handleDisconnect);
    };
  }, [setMessages]);

  return (
    <div>
      <ul id="messages">
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      <form id="form" action="" onSubmit={submitChatMessage}>
        <input
          id="input"
          type="text"
          placeholder="Type your message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button>Send</button>
      </form>
    </div>
  );
}
