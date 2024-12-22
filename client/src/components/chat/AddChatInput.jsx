import { useCallback, useState } from 'react';
import { addChat } from '../../api/chat-api';
import useClearErrorMessage from '../../hooks/useClearErrorMessage';

export default function AddChatInput({
  chatList,
  setChatList,
  errorMessage,
  setErrorMessage,
}) {
  const [inputUsername, setInputUsername] = useState('');

  // Adds a new chat to the sidebar
  const handleAddChat = useCallback(
    async (event) => {
      event.preventDefault();

      try {
        const response = await addChat(inputUsername, chatList);
        setChatList(response.updatedChatList);
        setInputUsername('');
      } catch (error) {
        setErrorMessage(error.message);
      }
    },
    [chatList, setChatList, inputUsername, setErrorMessage]
  );

    useClearErrorMessage(errorMessage, setErrorMessage);

  return (
    <div className='username-form-container'>
      <form id='username-form' action='' onSubmit={handleAddChat}>
        <div className='username-input-container'>
          <input
            id='username-input'
            type='text'
            placeholder='Enter a username'
            value={inputUsername}
            onChange={(event) => {
              setInputUsername(event.target.value);
              setErrorMessage('');
            }}
          />
          <button className='start-chat-button' style={{ marginLeft: '10px' }}>
            Start chat
          </button>
        </div>
        {errorMessage && (
          <div className='error-message' style={{ marginTop: '20px' }}>
            {errorMessage}
          </div>
        )}
      </form>
    </div>
  );
}
