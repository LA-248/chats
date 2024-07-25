import { useContext, useEffect, useState } from 'react';
import { MessageContext } from './MessageContext';
import { SocketContext } from '../pages/home';
import fetchUsername from '../utils/FetchUsername';

export default function MessageInput() {
  const { message, setMessage, setMessages, selectedChat, recipientId, isDisabled, setIsDisabled } = useContext(MessageContext);
  const [counter, setCounter] = useState(0);
  const socket = useContext(SocketContext);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Retrieve account username
    const fetchUser = async () => {
      try {
        const userData = await fetchUsername();
        setUsername(userData);
      } catch (error) {
        console.error('Failed to fetch user data:', error.message);
      }
    };
    fetchUser();
  }, []);

  const submitChatMessage = (event) => {
    event.preventDefault();

    if (message) {
      // Compute a unique offset
      const clientOffset = `${socket.id}-${counter}`;
      setCounter(counter + 1);
      // Send the message to the server
      socket.emit('chat-message', { username, recipientId, message }, clientOffset, (response) => {
        if (response) {
          console.log(response);
        }
      });
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
  }, [setMessages, socket]);

  useEffect(() => {
    const conditionalInput = () => {
      if (selectedChat === null) {
        setIsDisabled(true);
      } else {
        setIsDisabled(false);
      }
    }

    conditionalInput();
  }, [selectedChat, setIsDisabled]);

  return (
    <div>
      <form id="message-form" action="" onSubmit={submitChatMessage}>
        <div className="message-input-container">
          <input
            id="message-input"
            type="text"
            disabled={isDisabled}
            placeholder={isDisabled ?  "Select a chat" : "Message"}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <button className="submit-message-button">Send</button>
        </div>
      </form>
    </div>
  );
}
