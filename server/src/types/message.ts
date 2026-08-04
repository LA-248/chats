import { NewMessage } from '../schemas/message.schema.ts';
import { ChatType } from './chat.ts';

export type Message = {
  from: string;
  content: string;
  room: string;
  eventTime: NewMessage['event_time'];
  id: NewMessage['message_id'];
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

export type MessageSenderId = {
  messageSenderId: number;
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
}
