import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import { ChatContext } from '../../contexts/ChatContext';
import { getChatListByUserId, deleteChat } from '../../api/chat-api';
import ChatItem from './ChatItem';
import useClearErrorMessage from '../../hooks/useClearErrorMessage';
import { useSocketErrorHandling } from '../../hooks/useSocketErrorHandling';

export default function ChatList({ setSelectedChat, setRecipientUsername }) {
  const socket = useSocket();
  const {
    chatSearchInputText,
    setChatSearchInputText,
    chatList,
    setChatList,
    activeChatRoom,
    setActiveChatRoom,
  } = useContext(ChatContext);
  const [filteredChats, setFilteredChats] = useState([]);
  const [hoverChatId, setHoverChatId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Remove a conversation from the chat list
  const removeChat = async (room) => {
    try {
      await deleteChat(room);
      const storedChatList = await getChatListByUserId(); // Get updated chat list
      const updatedChatList = storedChatList;
      setChatList(updatedChatList);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleDeleteClick = (event, chat) => {
    event.stopPropagation();
    removeChat(chat.room);
    setChatSearchInputText('');
    if (activeChatRoom === chat.room) {
      navigate('/');
    }
  };

  const handleChatClick = (chat) => {
    setActiveChatRoom(chat.room);
    setSelectedChat(chat.recipient_username);
    setRecipientUsername(chat.recipient_username);
    navigate(`/chats/${chat.room}/${chat.recipient_username}`);
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

  // Filter chat list based on search input
  useEffect(() => {
    if (chatSearchInputText) {
      const filtered = chatList.filter((chat) =>
        chat.recipient_username
          .toLowerCase()
          .includes(chatSearchInputText.toLowerCase())
      );
      setFilteredChats(filtered);
    } else {
      setFilteredChats(chatList);
    }
  }, [chatSearchInputText, chatList]);


  useSocketErrorHandling(socket, setErrorMessage);
  useClearErrorMessage(errorMessage, setErrorMessage);

  return (
    <div className='chat-list'>
      {errorMessage ? (
        <div className='error-message' style={{ marginTop: '10px' }}>
          {errorMessage}
        </div>
      ) : null}
      {chatSearchInputText && filteredChats.length === 0 ? (
        <div id='no-chats-state'>No chats found</div>
      ) : (
        filteredChats
          .filter((chat) => chat.user_deleted === false)
          .map((chat) => (
            <ChatItem
              key={chat.chat_id}
              chat={chat}
              isActive={chat.room === activeChatRoom}
              isHovered={hoverChatId === chat.chat_id}
              onMouseEnter={() => setHoverChatId(chat.chat_id)}
              onMouseLeave={() => setHoverChatId(null)}
              onClick={() => handleChatClick(chat)}
              onDeleteClick={(event) => handleDeleteClick(event, chat)}
            />
          ))
      )}
    </div>
  );
}
