import { createContext, useState } from 'react';

const MessageContext = createContext();

const MessageProvider = ({ children }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageSearchValueText, setMessageSearchValueText] = useState('');

  return (
    <MessageContext.Provider
      value={{
        message,
        setMessage,
        messages,
        setMessages,
        currentMessage,
        setCurrentMessage,
        filteredMessages,
        setFilteredMessages,
        newMessage,
        setNewMessage,
        messageSearchValueText,
        setMessageSearchValueText,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export { MessageContext, MessageProvider };
