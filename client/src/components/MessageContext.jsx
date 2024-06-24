import { createContext, useState } from 'react';

const MessageContext = createContext();

const MessageProvider = ({ children }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [recipientId, setRecipientId] = useState(null);

  return (
    <MessageContext.Provider
      value={{
        message,
        setMessage,
        messages,
        setMessages,
        username,
        setUsername,
        selectedChat,
        setSelectedChat,
        recipientId,
        setRecipientId,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export { MessageContext, MessageProvider };
