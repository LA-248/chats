export interface Message {
  from: string;
  content: string;
  eventTime: Date;
  id: number;
  senderId: number;
  isEdited: boolean;
  chatType?: string;
  room?: string;
}
