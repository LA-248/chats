import { createContext, useState } from 'react';

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [chatList, setChatList] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [chatName, setChatName] = useState('');
  const [activeChatRoom, setActiveChatRoom] = useState(null);
  const [chatSearchInputText, setChatSearchInputText] = useState('');
  const [recipientProfilePicture, setRecipientProfilePicture] = useState(null);
  const [groupPicture, setGroupPicture] = useState(null);
  const [membersList, setMembersList] = useState([]);

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
