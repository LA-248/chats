import type { GroupMember } from './group';

export interface Chat {
  chat_id: string;
  chat_picture: string | null;
  chat_type: string;
  deleted: boolean;
  last_message_content: string | null;
  last_message_id: number | null;
  last_message_time: Date | null;
  last_message_type: string;
  name: string;
  read: boolean;
  recipient_user_id: number | null;
  room: string;
  updated_at: Date;
  created_at: Date;
}

export interface ChatMetadata {
  room: string;
  lastMessageContent: string;
  lastMessageTime: Date;
  lastMessageType: string;
  updatedAt: Date;
}

export enum ChatType {
  PRIVATE = 'chats',
  GROUP = 'groups',
}

export interface ChatContextType {
  chatList: Chat[];
  setChatList: React.Dispatch<React.SetStateAction<Chat[]>>;
  activeChatRoom: string | null;
  setActiveChatRoom: React.Dispatch<React.SetStateAction<string | null>>;
  chatSearchInputText: string;
  setChatSearchInputText: React.Dispatch<React.SetStateAction<string>>;
  chatId: number;
  setChatId: React.Dispatch<React.SetStateAction<number>>;
  chatName: string;
  setChatName: React.Dispatch<React.SetStateAction<string>>;
  recipientProfilePicture: string | null;
  setRecipientProfilePicture: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  groupPicture: string | null;
  setGroupPicture: React.Dispatch<React.SetStateAction<string>>;
  membersList: GroupMember[];
  setMembersList: React.Dispatch<React.SetStateAction<GroupMember[]>>;
}
