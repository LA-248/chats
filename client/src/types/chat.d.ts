export interface Chat {
  chat_id: number;
  chat_picture: string | null;
  chat_type: string;
  deleted: boolean;
  last_message_content: string | null;
  last_message_id: number | null;
  last_message_time: Date | null;
  name: string;
  read: boolean;
  recipient_user_id: number | null;
  room: string;
  updated_at: Date;
  created_at: Date;
}

export enum ChatType {
  PRIVATE = 'chats',
  GROUP = 'groups',
}
