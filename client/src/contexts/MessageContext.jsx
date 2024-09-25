import { createContext, useState } from 'react';

const MessageContext = createContext();

const MessageProvider = ({ children }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [recipientId, setRecipientId] = useState(null);
  const [recipientUsername, setRecipientUsername] = useState('');

  return (
    <MessageContext.Provider
      value={{
        message,
        setMessage,
        messages,
        setMessages,
        recipientId,
        setRecipientId,
        recipientUsername,
        setRecipientUsername,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export { MessageContext, MessageProvider };
