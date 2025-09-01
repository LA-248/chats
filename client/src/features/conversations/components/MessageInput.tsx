import { v4 as uuidv4 } from 'uuid';
import { useContext, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useSocket } from '../../../hooks/useSocket';
import { UserContext } from '../../../contexts/UserContext';
import { ChatContext } from '../../../contexts/ChatContext';
import { MessageType } from '../../../types/message';
import { useSendMediaMessage } from '../hooks/useSendMediaMessage';
import useClearErrorMessage from '../../../hooks/useClearErrorMessage';

export default function MessageInput() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(
    null
  ) as React.RefObject<HTMLFormElement>;
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
  const messageType = MessageType.TEXT;

  const handleChatMessageSubmission = (
    event: React.FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();
    if (message) {
      if (!socket) return;
      const content = message;

      // Compute a unique offset
      const clientOffset = uuidv4();
      // Send the message and its metadata to the server
      socket.emit(
        'chat-message',
        { username, chatId, content, room, chatType, messageType },
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

  // Handle media content
  const { handleFileInputClick, handleUpload } = useSendMediaMessage(
    fileInputRef,
    formRef,
    username,
    chatId,
    room!,
    chatType,
    setErrorMessage
  );
  useClearErrorMessage(errorMessage, setErrorMessage);

  return (
    <div>
      <form id='message-form' action='' onSubmit={handleChatMessageSubmission}>
        {showEmojiPicker ? (
          <div className='emoji-picker-container'></div>
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
            className='media-upload-button'
            onClick={handleFileInputClick}
            disabled={isBlocked}
            style={{
              opacity: isBlocked ? '0.5' : undefined,
              cursor: isBlocked ? 'auto' : 'pointer',
            }}
          >
            Media
          </button>
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
          <button
            type='submit'
            className='submit-message-button'
            style={{
              opacity: isBlocked ? '0.5' : undefined,
              cursor: isBlocked ? 'auto' : 'pointer',
            }}
          >
            Send
          </button>
        </div>
      </form>

      <form ref={formRef} id='media-upload-form' encType='multipart/form-data'>
        <input
          ref={fileInputRef}
          type='file'
          name='media-upload'
          accept='image/*'
          style={{ display: 'none' }}
          onChange={handleUpload}
        ></input>
      </form>
    </div>
  );
}
