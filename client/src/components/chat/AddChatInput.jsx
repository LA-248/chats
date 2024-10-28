import { useCallback, useEffect, useState } from 'react';
import { addChat, getChatListByUserId } from '../../api/chat-api';
import clearErrorMessage from '../../utils/ClearErrorMessage';

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
        const newChatItem = await addChat(inputUsername, chatList);
        let updatedChatList = chatList.concat(newChatItem);
        // Get the most recent and sorted version of the user's chat list
        // - ensures the chat list is in the correct order after a chat is deleted and re-added
        updatedChatList = await getChatListByUserId();
        setChatList(updatedChatList);
        setInputUsername('');
      } catch (error) {
        setErrorMessage(error.message);
      }
    },
    [chatList, setChatList, inputUsername, setErrorMessage]
  );

  // Clear error message after a certain amount of time
  useEffect(() => {
    clearErrorMessage(errorMessage, setErrorMessage);
  }, [errorMessage, setErrorMessage]);

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
          <div className='error-message' style={{ marginTop: '10px' }}>
            {errorMessage}
          </div>
        )}
      </form>
    </div>
  );
}
