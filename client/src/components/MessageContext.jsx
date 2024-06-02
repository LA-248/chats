import { createContext, useState } from 'react';

const MessageContext = createContext();

const MessageProvider = ({ children }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState('');
  let [connectedRoom, setConnectedRoom] = useState('');

  return (
    <MessageContext.Provider value={{ message, setMessage, messages, setMessages, room, setRoom, connectedRoom, setConnectedRoom }}>
      {children}
    </MessageContext.Provider>
  );
};

export { MessageContext, MessageProvider };
