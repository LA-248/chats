import { v4 as uuidv4 } from 'uuid';
import { useContext, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useSocket } from '../../../hooks/useSocket';
import { UserContext } from '../../../contexts/UserContext';
import { ChatContext } from '../../../contexts/ChatContext';
import useClearErrorMessage from '../../../hooks/useClearErrorMessage';

export default function MessageInput() {
  const socket = useSocket();
  const location = useLocation();
  const pathSegments = location.pathname.split('/');
  const chatType = pathSegments[1];
  const { room } = useParams();

  const { chatId } = useContext(ChatContext);
  const { loggedInUsername, isBlocked } = useContext(UserContext);

  const [message, setMessage] = useState<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const username = loggedInUsername;

  const handleChatMessageSubmission = (
    event: React.FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();
    if (message) {
      if (!socket) return;

      // Compute a unique offset
      const clientOffset = uuidv4();
      // Send the message and its metadata to the server
      socket.emit(
        'chat-message',
        { username, chatId, message, room, chatType },
        clientOffset,
        (response: string) => {
          if (response) {
            setErrorMessage(response);
          }
        }
      );
      setMessage('');
    }
  };

  useClearErrorMessage(errorMessage, setErrorMessage);

  return (
    <div>
      <form id='message-form' action='' onSubmit={handleChatMessageSubmission}>
        {showEmojiPicker ? (
          <div className='emoji-picker-container'>
          </div>
        ) : null}

        <div
          className='error-message'
          style={{ marginBottom: '10px', textAlign: 'left' }}
        >
          {errorMessage}
        </div>

        <div className='message-input-container'>
          <input
            id='message-input'
            type='text'
            placeholder={
              isBlocked
                ? 'You have this user blocked, unblock to message them'
                : 'Message'
            }
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={isBlocked}
            autoFocus
          />
          <button
            type='button'
            className='emoji-picker-button'
            onClick={(event) => {
              event.stopPropagation();
              setShowEmojiPicker((value) => !value);
            }}
            disabled={isBlocked}
            style={{
              opacity: isBlocked ? '0.5' : undefined,
              cursor: isBlocked ? 'auto' : 'pointer',
            }}
          >
            Emojis
          </button>
          <button type='submit' className='submit-message-button'>
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
