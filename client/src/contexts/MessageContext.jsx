import { createContext, useState } from 'react';

const MessageContext = createContext();

const MessageProvider = ({ children }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [recipientId, setRecipientId] = useState(null);
  const [recipientUsername, setRecipientUsername] = useState('');
  const [messageSearchValueText, setMessageSearchValueText] = useState('');

  return (
    <MessageContext.Provider
      value={{
        message,
        setMessage,
        messages,
        setMessages,
        filteredMessages,
        setFilteredMessages,
        recipientId,
        setRecipientId,
        recipientUsername,
        setRecipientUsername,
        messageSearchValueText,
        setMessageSearchValueText,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export { MessageContext, MessageProvider };
