import { v4 as uuidv4 } from 'uuid';
import { useContext, useEffect, useState } from 'react';
import { MessageContext } from './MessageContext';
import { SocketContext } from '../pages/home';
import fetchUsername from '../utils/FetchUsername';
import clearErrorMessage from '../utils/ErrorMessageTimeout';

export default function MessageInput({ setMessages }) {
  const { message, setMessage, recipientId } = useContext(MessageContext);
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const socket = useContext(SocketContext);

  useEffect(() => {
    clearErrorMessage(errorMessage, setErrorMessage);
  }, [errorMessage]);

  useEffect(() => {
    // Retrieve account username
    const fetchUser = async () => {
      try {
        const userData = await fetchUsername();
        setUsername(userData);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };
    fetchUser();
  }, []);

  const submitChatMessage = (event) => {
    event.preventDefault();

    if (message) {
      // Compute a unique offset
      const clientOffset = uuidv4();
      // Send the message to the server
      socket.emit('chat-message', { username, recipientId, message }, clientOffset, (response) => {
        if (response) {
          setErrorMessage(response);
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

  return (
    <div>
      <form id="message-form" action="" onSubmit={submitChatMessage}>
        <div className="error-message" style={{marginBottom: '10px', textAlign: 'left'}}>{errorMessage}</div>
        <div className="message-input-container">
          <input
            id="message-input"
            type="text"
            placeholder="Message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <button className="submit-message-button">Send</button>
        </div>
      </form>
    </div>
  );
}
