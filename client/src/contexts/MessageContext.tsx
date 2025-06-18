import { createContext, ReactNode, useState } from 'react';

export interface MessageContextType {
  messages: string[];
  setMessages: React.Dispatch<React.SetStateAction<string[]>>;
  currentMessage: string;
  setCurrentMessage: React.Dispatch<React.SetStateAction<string>>;
  filteredMessages: string[];
  setFilteredMessages: React.Dispatch<React.SetStateAction<string[]>>;
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  messageSearchValueText: string;
  setMessageSearchValueText: React.Dispatch<React.SetStateAction<string>>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [filteredMessages, setFilteredMessages] = useState<string[]>([]);
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
