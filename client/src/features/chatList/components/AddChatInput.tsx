import { useCallback, useState } from 'react';
import { addChat } from '../../../api/private-chat-api';
import useClearErrorMessage from '../../../hooks/useClearErrorMessage';
import { Chat } from '../../../types/chat';

interface AddChatInputProps {
  chatList: Chat[];
  setChatList: React.Dispatch<React.SetStateAction<Chat[]>>;
  errorMessage: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
}

export default function AddChatInput({
  chatList,
  setChatList,
  errorMessage,
  setErrorMessage,
}: AddChatInputProps) {
  const [inputUsername, setInputUsername] = useState<string>('');

  // Adds a new chat to the sidebar
  const handleAddChat = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      try {
        const exists = chatList.some(
          (chat) => chat.name === inputUsername && chat.deleted === false
        );
        if (exists) {
          throw new Error('You already have an active chat with this user');
        }
        if (!inputUsername) {
          throw new Error('Please enter a username');
        }

        const addedChat = await addChat(inputUsername);
        setChatList((prevChatList) => {
          const updatedList = [addedChat, ...prevChatList];
          // Sorting must be done here for when chats are restored,
          // since a re-added chat might not be the most recently updated one
          return updatedList.sort(
            (a, b) =>
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime()
          );
        });
        setInputUsername('');
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        }
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
            placeholder='Find or start a conversation'
            value={inputUsername}
            onChange={(event) => {
              setInputUsername(event.target.value);
              setErrorMessage('');
            }}
          />
          <button
            className='start-chat-button'
            style={{
              marginLeft: '10px',
              opacity:
                inputUsername.trim().length === 0 || inputUsername.includes(' ')
                  ? '0.4'
                  : undefined,
              cursor:
                inputUsername.trim().length === 0 || inputUsername.includes(' ')
                  ? 'auto'
                  : undefined,
            }}
            disabled={
              inputUsername.trim().length === 0 || inputUsername.includes(' ')
            }
          >
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
