import type { ChatType } from './chat';

export type Message = {
  from: string;
  content: string;
  room: string;
  eventTime: Date;
  id: number;
  senderId: number;
  isEdited?: boolean;
  chatType: ChatType;
  messageType: MessageType;
}

export type ClientMessageEventPayload = {
  username: string;
  chatId: number;
  content: string;
  room: string;
  chatType: ChatType;
  messageType: MessageType;
  fileKey?: string;
}

export type MessageContextType = {
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
  VIDEO = 'video',
}

export enum MessageUpdateEventType {
  DELETE = 'deleting',
  EDIT = 'editing',
}
