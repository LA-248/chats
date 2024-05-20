import { createContext, useState } from 'react';

const MessageContext = createContext();

const MessageProvider = ({ children }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  return (
    <MessageContext.Provider value={{ message, setMessage, messages, setMessages }}>
      {children}
    </MessageContext.Provider>
  );
};

export { MessageContext, MessageProvider };
