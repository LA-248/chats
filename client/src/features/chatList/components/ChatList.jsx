import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../../../hooks/useSocket';
import { ChatContext } from '../../../contexts/ChatContext';
import {
  getChatListByUserId,
  updateReadStatus,
} from '../../../api/private-chat-api';
import ChatItem from './ChatItem';
import useClearErrorMessage from '../../../hooks/useClearErrorMessage';
import useChatUpdates from '../../conversations/hooks/useChatUpdates';
import useAddGroupToChatList from '../hooks/useAddGroupToChatList';
import useAddPrivateChatToChatList from '../hooks/useAddPrivateChatToChatList';
import { useChatDelete } from '../hooks/useChatDelete';
import { useSocketErrorHandling } from '../../../hooks/useSocketErrorHandling';
import { markUserAsRead } from '../../../api/group-chat-api';
import useChatListUpdate from '../hooks/useChatListUpdate';

export default function ChatList({ setChatName }) {
  const socket = useSocket();
  const { room } = useParams();
  const {
    chatSearchInputText,
    setChatSearchInputText,
    chatList,
    setChatList,
    activeChatRoom,
    setActiveChatRoom,
    setRecipientProfilePicture,
    setGroupPicture,
  } = useContext(ChatContext);
  const [filteredChats, setFilteredChats] = useState([]);
  const [hoverChatId, setHoverChatId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChatClick = async (chat) => {
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
    const displayChatList = async () => {
      try {
        const result = await getChatListByUserId();
        setChatList(result);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    displayChatList();
  }, [setChatList]);

  // Remove a group chat that a user left or was kicked out of from their chat list
  useEffect(() => {
    if (!socket) return;

    const handleGroupChatRemoval = (data) => {
      setChatList((prevChatList) =>
        prevChatList.filter((group) => group.room !== data.room)
      );
      setActiveChatRoom(null);
      navigate(data.redirectPath);
    };

    socket.on('remove-group-chat', handleGroupChatRemoval);

    return () => {
      socket.off('remove-group-chat', handleGroupChatRemoval);
    };
  }, [socket, setChatList, navigate, setActiveChatRoom]);

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
  // When a user receives their first message from another user, add the chat in real-time
  useAddPrivateChatToChatList(socket, setChatList);

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
              isHovered={hoverChatId === chat.chat_id}
              onMouseEnter={() => setHoverChatId(chat.chat_id)}
              onMouseLeave={() => setHoverChatId(null)}
              onClick={() => handleChatClick(chat)}
              onDeleteClick={(event) => handleChatDelete(event, chat)}
            />
          ))
      )}
    </div>
  );
}
