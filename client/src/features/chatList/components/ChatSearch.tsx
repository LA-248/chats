import { useContext } from 'react';
import { ChatContext } from '../../../contexts/ChatContext';

export default function ChatSearch() {
  const chatContext = useContext(ChatContext);
  if (!chatContext) {
    throw new Error();
  }
  const { chatSearchInputText, setChatSearchInputText } = chatContext;

  return (
    <div className='chat-search-input-container'>
      <input
        id='chat-search-input'
        type='text'
        placeholder='Search chats'
        value={chatSearchInputText}
        onChange={(event) => setChatSearchInputText(event.target.value)}
      ></input>
    </div>
  );
}
