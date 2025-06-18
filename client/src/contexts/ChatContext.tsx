import { createContext, ReactNode, useState } from 'react';
import { Chat } from '../types/chat';
import { GroupMember } from '../types/group';

export interface ChatContextType {
  chatList: Chat[];
  setChatList: React.Dispatch<React.SetStateAction<Chat[]>>;
  activeChatRoom: string | null;
  setActiveChatRoom: React.Dispatch<React.SetStateAction<string | null>>;
  chatSearchInputText: string;
  setChatSearchInputText: React.Dispatch<React.SetStateAction<string>>;
  chatId: number | null;
  setChatId: React.Dispatch<React.SetStateAction<number | null>>;
  chatName: string;
  setChatName: React.Dispatch<React.SetStateAction<string>>;
  recipientProfilePicture: string | null;
  setRecipientProfilePicture: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  groupPicture: string | null;
  setGroupPicture: React.Dispatch<React.SetStateAction<string | null>>;
  membersList: GroupMember[];
  setMembersList: React.Dispatch<React.SetStateAction<GroupMember[]>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [chatId, setChatId] = useState<number | null>(null);
  const [chatName, setChatName] = useState<string>('');
  const [activeChatRoom, setActiveChatRoom] = useState<string | null>(null);
  const [chatSearchInputText, setChatSearchInputText] = useState<string>('');
  const [recipientProfilePicture, setRecipientProfilePicture] = useState<
    string | null
  >(null);
  const [groupPicture, setGroupPicture] = useState<string | null>(null);
  const [membersList, setMembersList] = useState<GroupMember[]>([]);

  return (
    <ChatContext.Provider
      value={{
        chatList,
        setChatList,
        activeChatRoom,
        setActiveChatRoom,
        chatSearchInputText,
        setChatSearchInputText,
        chatId,
        setChatId,
        chatName,
        setChatName,
        recipientProfilePicture,
        setRecipientProfilePicture,
        groupPicture,
        setGroupPicture,
        membersList,
        setMembersList,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export { ChatContext, ChatProvider };
