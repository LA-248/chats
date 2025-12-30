import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../../../hooks/useSocket';
import { ChatContext } from '../../../contexts/ChatContext';
import type { Chat } from '../../../types/chat';
import {
  getChatListByUserId,
  updateReadStatus,
} from '../../../api/private-chat-api';
import ChatItem from './ChatItem';
import useClearErrorMessage from '../../../hooks/useClearErrorMessage';
import useChatListUpdate from '../hooks/useChatListUpdate';
import useChatUpdates from '../../chats/hooks/useChatUpdates';
import useAddGroup from '../hooks/useAddGroup';
import useAddNewPrivateChat from '../../chats/hooks/useAddPrivateChat';
import { useChatDelete } from '../hooks/useChatDelete';
import { useSocketErrorHandling } from '../../../hooks/useSocketErrorHandling';
import { markUserAsRead } from '../../../api/group-chat-api';
import useRemoveGroupChat from '../hooks/useRemoveGroupChat';

export default function ChatList({
  setChatName,
}: {
  setChatName: React.Dispatch<React.SetStateAction<string>>;
}) {
  const socket = useSocket();
  const navigate = useNavigate();
  const { room } = useParams();

  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [hoverChatId, setHoverChatId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const {
    chatSearchInputText,
    setChatSearchInputText,
    chatList,
    setChatList,
    activeChatRoom,
    setActiveChatRoom,
  } = useContext(ChatContext);

  const handleChatClick = async (chat: Chat): Promise<void> => {
    setActiveChatRoom(chat.room);
    setChatName(chat.name);

    if (chat.chat_type === 'private_chat') {
      navigate(`/chats/${chat.room}`);
      if (!chat.read) {
        await updateReadStatus(true, chat.room);
      }
    } else {
      navigate(`/groups/${chat.room}`);
      if (!chat.read) {
        await markUserAsRead(chat.room);
      }
    }
  };

  // Retrieve the user's chat list for display
  useEffect(() => {
    const displayChatList = async (): Promise<void> => {
      try {
        const chatList = await getChatListByUserId();
        setChatList(chatList);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        }
      }
    };

    displayChatList();
  }, [setChatList]);

  // Filter chat list based on search input
  useEffect(() => {
    if (chatSearchInputText) {
      const filtered = chatList.filter((chat) =>
        chat.name.toLowerCase().includes(chatSearchInputText.toLowerCase())
      );
      setFilteredChats(filtered);
    } else {
      setFilteredChats(chatList);
    }
  }, [chatSearchInputText, chatList]);

  const handleChatDelete = useChatDelete(
    setChatList,
    setChatSearchInputText,
    activeChatRoom,
    setActiveChatRoom,
    setErrorMessage
  );

  useChatListUpdate(socket, setChatList, activeChatRoom);
  useAddGroup(socket, setChatList); // When a user is added to a group chat, notify them and add it to their chat list
  useRemoveGroupChat(socket, setChatList, setActiveChatRoom, navigate);
  useAddNewPrivateChat(socket, setChatList);
  useChatUpdates(socket, setChatList, room!);

  useSocketErrorHandling(socket, setErrorMessage);
  useClearErrorMessage(errorMessage, setErrorMessage);

  return (
    <div className='chat-list'>
      {errorMessage ? (
        <div className='error-message' style={{ margin: '10px 0px 10px 0px' }}>
          {errorMessage}
        </div>
      ) : null}
      {chatSearchInputText && filteredChats.length === 0 ? (
        <div id='no-chats-state'>No chats found</div>
      ) : (
        filteredChats
          .filter((chat) => !chat.deleted)
          .map((chat) => (
            <ChatItem
              key={chat.chat_id}
              chat={chat}
              isActive={chat.room === activeChatRoom}
              isHovered={hoverChatId === chat.chat_id}
              onMouseEnter={() => setHoverChatId(chat.chat_id)}
              onMouseLeave={() => setHoverChatId('')}
              onClick={() => handleChatClick(chat)}
              onDeleteClick={(event) => handleChatDelete(event, chat)}
            />
          ))
      )}
    </div>
  );
}
