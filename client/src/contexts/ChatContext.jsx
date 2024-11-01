import { createContext, useState } from 'react';

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [chatList, setChatList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isBlocked, setIsBlocked] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatSearchInputText, setChatSearchInputText] = useState('');

  return (
    <ChatContext.Provider
      value={{
        chatList,
        setChatList,
        selectedChat,
        setSelectedChat,
        isBlocked,
        setIsBlocked,
        activeChatId,
        setActiveChatId,
        chatSearchInputText,
        setChatSearchInputText,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export { ChatContext, ChatProvider };
