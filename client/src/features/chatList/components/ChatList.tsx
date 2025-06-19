import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../../../hooks/useSocket';
import { ChatContext } from '../../../contexts/ChatContext';
import { Chat } from '../../../types/chat';
import {
  getChatListByUserId,
  updateReadStatus,
} from '../../../api/private-chat-api';
import ChatItem from './ChatItem';
import useClearErrorMessage from '../../../hooks/useClearErrorMessage';
import useChatListUpdate from '../hooks/useChatListUpdate';
import useChatUpdates from '../../conversations/hooks/useChatUpdates';
import useAddGroupToChatList from '../hooks/useAddGroupToChatList';
import useAddPrivateChatToChatList from '../../conversations/hooks/useAddPrivateChat';
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
  const { room } = useParams();

  if (!socket) return;

  const chatContext = useContext(ChatContext);
  if (!chatContext) {
    throw new Error();
  }
  const {
    chatSearchInputText,
    setChatSearchInputText,
    chatList,
    setChatList,
    activeChatRoom,
    setActiveChatRoom,
    setRecipientProfilePicture,
    setGroupPicture,
  } = chatContext;

  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [hoverChatId, setHoverChatId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const navigate = useNavigate();

  const handleChatClick = async (chat: Chat): Promise<void> => {
    setActiveChatRoom(chat.room);
    setChatName(chat.name);

    if (chat.chat_type === 'private_chat') {
      navigate(`/chats/${chat.room}`);
      if (chat.read === false) {
        await updateReadStatus(true, chat.room);
      }
    } else {
      navigate(`/groups/${chat.room}`);
      if (chat.read === false) {
        await markUserAsRead(chat.room);
      }
    }
  };

  // Retrieve the user's chat list for display
  useEffect(() => {
    const displayChatList = async (): Promise<void> => {
      try {
        const result = await getChatListByUserId();
        setChatList(result);
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

  // When a user is added to a group chat, notify them and add it to their chat list
  useAddGroupToChatList(socket, setChatList);
  useRemoveGroupChat(socket, setChatList, setActiveChatRoom, navigate);
  useAddPrivateChatToChatList(socket, setChatList);

  if (room) {
    // Update the picture of a group for all its members in real-time
    useChatUpdates(
      socket,
      setChatList,
      'room',
      'room',
      'chat_picture',
      'groupPicture',
      room,
      setGroupPicture,
      'update-group-picture'
    );
    // Update the profile picture of a private chat contact when changed
    useChatUpdates(
      socket,
      setChatList,
      'recipient_user_id',
      'userId',
      'chat_picture',
      'profilePicture',
      room,
      setRecipientProfilePicture,
      'update-profile-picture-for-contacts'
    );
    // Update the username of a private chat contact when changed
    useChatUpdates(
      socket,
      setChatList,
      'recipient_user_id',
      'userId',
      'name',
      'newUsername',
      room,
      setChatName,
      'update-username-for-contacts'
    );
  }
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
          .filter((chat) => chat.deleted === false)
          .map((chat) => (
            <ChatItem
              key={chat.chat_id}
              chat={chat}
              isActive={chat.room === activeChatRoom}
              isHovered={hoverChatId === Number(chat.chat_id)}
              onMouseEnter={() => setHoverChatId(Number(chat.chat_id))}
              onMouseLeave={() => setHoverChatId(null)}
              onClick={() => handleChatClick(chat)}
              onDeleteClick={(event) => handleChatDelete(event, chat)}
            />
          ))
      )}
    </div>
  );
}
