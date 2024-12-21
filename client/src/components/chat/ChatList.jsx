import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import { ChatContext } from '../../contexts/ChatContext';
import { UserContext } from '../../contexts/UserContext';
import { getChatListByUserId, deleteChat } from '../../api/chat-api';
import ChatItem from './ChatItem';

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
  const { loggedInUserId } = useContext(UserContext);
  const [filteredChats, setFilteredChats] = useState([]);
  const [hoverChatId, setHoverChatId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Handles updating the read status of a message
  const handleMessageReadStatusUpdate = (chat) => {
    if (chat.has_new_message) {
      socket.emit('update-message-read-status', {
        hasNewMessage: false,
        room: chat.room,
      });
      // Update chat list state
      chat.has_new_message = false;
      const updatedChatList = [...chatList];
      setChatList(updatedChatList);
    }
  };

  // Remove a conversation from the chat list
  const removeChat = async (userId, chatId) => {
    try {
      await deleteChat(userId, chatId);
      const storedChatList = await getChatListByUserId(); // Get updated chat list
      const updatedChatList = storedChatList;
      setChatList(updatedChatList);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleChatClick = (chat) => {
    setActiveChatRoom(chat.room);
    setSelectedChat(chat.recipient_username);
    setRecipientUsername(chat.recipient_username);
    handleMessageReadStatusUpdate(chat);
    navigate(`/chats/${chat.room}/${chat.recipient_username}`);
  };

  const handleDeleteClick = (event, chat) => {
    event.stopPropagation();
    removeChat(loggedInUserId, chat.chat_id);
    setChatSearchInputText('');
    if (activeChatRoom === chat.room) {
      navigate('/');
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

  // Automatically mark messages as read in the currently open chat
  useEffect(() => {
    filteredChats.forEach((chat) => {
      if (activeChatRoom === chat.room) {
        handleMessageReadStatusUpdate(chat);
      }
    });
  });

  // Handle socket errors
  useEffect(() => {
    const handleError = (errorResponse) => {
      setErrorMessage(errorResponse.error);
    };
    socket.on('custom-error', handleError);

    return () => {
      socket.off('custom-error', handleError);
    };
  }, [socket]);

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
