import { createContext, useState } from 'react';

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [chatList, setChatList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isBlocked, setIsBlocked] = useState(null);
  const [activeChatInfo, setActiveChatInfo] = useState(null);
  const [activeChatRoom, setActiveChatRoom] = useState(null);
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
