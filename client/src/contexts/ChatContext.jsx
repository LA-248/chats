import { createContext, useState } from 'react';

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [chatList, setChatList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [username, setUsername] = useState('');

  return (
    <ChatContext.Provider
      value={{
        chatList,
        setChatList,
        selectedChat,
        setSelectedChat,
        username,
        setUsername,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export { ChatContext, ChatProvider };
