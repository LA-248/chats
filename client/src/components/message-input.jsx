import { useContext, useEffect, useState } from 'react';
import { MessageContext } from './message-context';
import socket from './socket';

export default function MessageInput() {
  const { message, setMessage, setMessages, room, connectedRoom } = useContext(MessageContext);
  const [counter, setCounter] = useState(0);
  const [placeholder, setPlaceholder] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);

  const submitChatMessage = (event) => {
    event.preventDefault();

    if (message) {
      // Compute a unique offset
      const clientOffset = `${socket.id}-${counter}`;
      setCounter(counter + 1);
      // Send the message to the server
      socket.emit('chat-message', { room, message }, clientOffset);
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

  // Configure message input depending on if the user has joined a room or not
  useEffect(() => {
    if (!connectedRoom) {
      setIsDisabled(true);
      setPlaceholder('Join a room to start messaging');
    } else if (connectedRoom) {
      setIsDisabled(false);
      setPlaceholder('Type your message');
    }
  }, [connectedRoom]);

  return (
    <div>
      <form id="message-form" action="" onSubmit={submitChatMessage}>
        <div className="message-input-container">
          <input
            id="message-input"
            type="text"
            placeholder={placeholder}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={isDisabled}
          />
          <button className="submit-message-button">Send</button>
        </div>
      </form>
    </div>
  );
}
