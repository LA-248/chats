import { createContext, useState } from 'react';

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [chatList, setChatList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [username, setUsername] = useState('');
  const [isBlocked, setIsBlocked] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [loggedInUsername, setLoggedInUsername] = useState('');

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
        loggedInUsername,
        setLoggedInUsername,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export { ChatContext, ChatProvider };
