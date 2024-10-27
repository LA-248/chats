import { useContext, useEffect } from 'react';
import { ChatContext } from '../../contexts/ChatContext';

export default function ChatSearch({
  chatSearchInputText,
  setChatSearchInputText,
}) {
  const { chatList, setFilteredChats } = useContext(ChatContext);

  // Filter chat list based on search input
  useEffect(() => {
    if (chatSearchInputText) {
      const filtered = chatList.filter((chat) =>
        chat.name.toLowerCase().includes(chatSearchInputText.toLowerCase())
      );
      setFilteredChats(filtered);
    } else {
      setFilteredChats(chatList);
    }
  }, [chatSearchInputText, chatList, setFilteredChats]);

  return (
    <div className='chat-search-input-container'>
      <input
        id='chat-search-input'
        type='text'
        placeholder='Find a conversation'
        value={chatSearchInputText}
        onChange={(event) => setChatSearchInputText(event.target.value)}
      ></input>
    </div>
  );
}
