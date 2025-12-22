import { ChatType } from './chat.ts';

export interface MessageEvent {
  username: string;
  chatId: number;
  content: string;
  room: string;
  chatType: ChatType;
  messageType: MessageType;
  fileKey?: string;
}

export interface MessageSenderId {
  messageSenderId: number;
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
}
