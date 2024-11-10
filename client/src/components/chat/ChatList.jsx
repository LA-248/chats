import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import { ChatContext } from '../../contexts/ChatContext';
import { getChatListByUserId, deleteChat } from '../../api/chat-api';
import ChatItem from './ChatItem';

export default function ChatList({ setSelectedChat, setRecipientUsername }) {
  const socket = useSocket();
  const {
    chatSearchInputText,
    setChatSearchInputText,
    chatList,
    setChatList,
    activeChatId,
    setActiveChatId,
  } = useContext(ChatContext);
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
  const removeChat = async (id) => {
    try {
      await deleteChat(id);
      const storedChatList = await getChatListByUserId(); // Get updated chat list
      const updatedChatList = storedChatList;
      setChatList(updatedChatList);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleChatClick = (chat) => {
    setActiveChatId(chat.chat_id);
    setSelectedChat(chat.name);
    setRecipientUsername(chat.name);

    localStorage.setItem(
      'active-chat',
      JSON.stringify({
        id: chat.chat_id,
        name: chat.name,
        recipient_id: chat.recipient_id,
        recipient_profile_picture:
          chat.recipient_profile_picture || '/images/default-avatar.jpg',
      })
    );

    handleMessageReadStatusUpdate(chat);
    navigate(`/messages/${chat.room}`);
  };

  const handleDeleteClick = (event, chat) => {
    event.stopPropagation();
    removeChat(chat.chat_id);
    setChatSearchInputText('');
    if (activeChatId === chat.chat_id) {
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
        chat.name.toLowerCase().includes(chatSearchInputText.toLowerCase())
      );
      setFilteredChats(filtered);
    } else {
      setFilteredChats(chatList);
    }
  }, [chatSearchInputText, chatList]);

  // Automatically mark messages as read in the currently open chat
  useEffect(() => {
    filteredChats.forEach((chat) => {
      if (activeChatId === chat.chat_id) {
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
        <div className='error-message'>{errorMessage}</div>
      ) : null}
      {chatSearchInputText && filteredChats.length === 0 ? (
        <div id='no-chats-state'>No chats found</div>
      ) : (
        filteredChats.map((chat) => (
          <ChatItem
            key={chat.chat_id}
            chat={chat}
            isActive={chat.chat_id === activeChatId}
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
