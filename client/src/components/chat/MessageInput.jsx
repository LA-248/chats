import { v4 as uuidv4 } from 'uuid';
import { useContext, useState } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { MessageContext } from '../../contexts/MessageContext';
import { UserContext } from '../../contexts/UserContext';
import { ChatContext } from '../../contexts/ChatContext';
import useClearErrorMessage from '../../hooks/useClearErrorMessage';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

export default function MessageInput() {
  const socket = useSocket();
  const { message, setMessage, recipientId } = useContext(MessageContext);
  const { loggedInUsername } = useContext(UserContext);
  const { isBlocked } = useContext(ChatContext);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const username = loggedInUsername;

  const handleChatMessageSubmission = (event) => {
    event.preventDefault();

    if (message) {
      // Compute a unique offset
      const clientOffset = uuidv4();
      // Send the message and its metadata to the server
      socket.emit(
        'chat-message',
        { username, recipientId, message },
        clientOffset,
        (response) => {
          if (response) {
            setErrorMessage(response);
          }
        }
      );
      setMessage('');
    }
  };

  // Add the emoji(s) to the existing message
  const handleAddEmoji = (emoji) => {
    setMessage((prevMessage) => prevMessage + emoji.native);
  };

  useClearErrorMessage(errorMessage, setErrorMessage);

  return (
    <div>
      <form id='message-form' action='' onSubmit={handleChatMessageSubmission}>
        {showEmojiPicker ? (
          <div className='emoji-picker-container'>
            <Picker
              data={data}
              onEmojiSelect={handleAddEmoji}
              onClickOutside={() => setShowEmojiPicker(false)}
            />
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
          />
          <button
            type='button'
            className='emoji-picker-button'
            onClick={(event) => {
              event.stopPropagation();
              setShowEmojiPicker((value) => !value);
            }}
            disabled={isBlocked}
            style={{ opacity: isBlocked ? '0.5' : null }}
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
