export interface Message {
  from: string;
  content: string;
  eventTime: Date;
  id: number;
  senderId: number;
  isEdited: boolean;
  chatType?: string;
  room?: string;
  type: string;
}

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

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
}
