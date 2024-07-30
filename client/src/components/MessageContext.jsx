import { createContext, useState } from 'react';

const MessageContext = createContext();

const MessageProvider = ({ children }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [username, setUsername] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [recipientId, setRecipientId] = useState(null);
  const [chatList, setChatList] = useState([]);

  return (
    <MessageContext.Provider
      value={{
        message,
        setMessage,
        messages,
        setMessages,
        activeChatId,
        setActiveChatId,
        username,
        setUsername,
        selectedChat,
        setSelectedChat,
        recipientId,
        setRecipientId,
        chatList,
        setChatList,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export { MessageContext, MessageProvider };
