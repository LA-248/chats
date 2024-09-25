import { v4 as uuidv4 } from 'uuid';
import { useContext, useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { MessageContext } from '../contexts/MessageContext';
import { UserContext } from '../contexts/UserContext';
import { ChatContext } from '../contexts/ChatContext';
import clearErrorMessage from '../utils/ClearErrorMessage';

export default function MessageInput() {
  const socket = useSocket();
  const { message, setMessage, recipientId } = useContext(MessageContext);
  const { loggedInUsername } = useContext(UserContext);
  const { isBlocked } = useContext(ChatContext);
  const [errorMessage, setErrorMessage] = useState('');
  const username = loggedInUsername;

  useEffect(() => {
    clearErrorMessage(errorMessage, setErrorMessage);
  }, [errorMessage]);

  const submitChatMessage = (event) => {
    event.preventDefault();

    if (message) {
      // Compute a unique offset
      const clientOffset = uuidv4();
      // Send the message and its metadata to the server
      socket.emit('chat-message', { username, recipientId, message }, clientOffset, (response) => {
        if (response) {
          setErrorMessage(response);
        }
      });
      setMessage('');
    }
  };

  return (
    <div>
      <form id="message-form" action="" onSubmit={submitChatMessage}>
        <div className="error-message" style={{marginBottom: '10px', textAlign: 'left'}}>{errorMessage}</div>
        <div className="message-input-container">
          <input
            id="message-input"
            type="text"
            placeholder={
              isBlocked
                ? 'You have this user blocked, unblock to message them'
                : 'Message'
            }
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={isBlocked}
          />
          <button className="submit-message-button">Send</button>
        </div>
      </form>
    </div>
  );
}
