import { createContext, useState } from 'react';

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [chatList, setChatList] = useState([]);
  const [activeChatInfo, setActiveChatInfo] = useState(null);
  const [activeChatRoom, setActiveChatRoom] = useState(null);
  const [chatSearchInputText, setChatSearchInputText] = useState('');

  return (
    <ChatContext.Provider
      value={{
        chatList,
        setChatList,
        activeChatInfo,
        setActiveChatInfo,
        activeChatRoom,
        setActiveChatRoom,
        chatSearchInputText,
        setChatSearchInputText,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export { ChatContext, ChatProvider };
