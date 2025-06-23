import { createContext, type ReactNode, useState } from 'react';
import type { Message, MessageContextType } from '../types/message';

const defaultMessageContext: MessageContextType = {
  messages: [],
  setMessages: () => {},
  currentMessage: '',
  setCurrentMessage: () => {},
  filteredMessages: [],
  setFilteredMessages: () => {},
  newMessage: '',
  setNewMessage: () => {},
  messageSearchValueText: '',
  setMessageSearchValueText: () => {},
};

const MessageContext = createContext<MessageContextType>(defaultMessageContext);

const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [messageSearchValueText, setMessageSearchValueText] =
    useState<string>('');

  return (
    <MessageContext.Provider
      value={{
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
