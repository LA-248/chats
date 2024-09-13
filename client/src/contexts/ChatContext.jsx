import { createContext, useState } from 'react';

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [chatList, setChatList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [username, setUsername] = useState('');
  const [isBlocked, setIsBlocked] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);

  return (
    <ChatContext.Provider
      value={{
        chatList,
        setChatList,
        selectedChat,
        setSelectedChat,
        username,
        setUsername,
        isBlocked,
        setIsBlocked,
        activeChatId,
        setActiveChatId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export { ChatContext, ChatProvider };
