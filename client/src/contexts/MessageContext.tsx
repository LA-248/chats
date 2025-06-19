import { createContext, ReactNode, useState } from 'react';
import { Message } from '../types/message';

export interface MessageContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  currentMessage: string;
  setCurrentMessage: React.Dispatch<React.SetStateAction<string>>;
  filteredMessages: Message[];
  setFilteredMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  messageSearchValueText: string;
  setMessageSearchValueText: React.Dispatch<React.SetStateAction<string>>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

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
