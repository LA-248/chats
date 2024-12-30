import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import { ChatContext } from '../../contexts/ChatContext';
import {
  getChatListByUserId,
  deleteChat,
  updateReadStatus,
} from '../../api/chat-api';
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

  const handleChatClick = async (chat) => {
    setActiveChatRoom(chat.room);
    setSelectedChat(chat.recipient_username);
    setRecipientUsername(chat.recipient_username);
    navigate(`/chats/${chat.room}/${chat.recipient_username}`);
    if (chat.read === false) {
      await updateReadStatus(true, chat.room);
    }
  };

  // Remove a conversation from the chat list
  const handleChatDelete = async (event, chat) => {
    event.stopPropagation();
    try {
      await deleteChat(chat.room);
      // Mark chat as deleted in local chat list state
      const updatedChatList = chatList.map((chatItem) => {
        if (chatItem.room === chat.room) {
          return { ...chatItem, user_deleted: true };
        }
        return chatItem;
      });
      setChatList(updatedChatList);
      setChatSearchInputText('');
      if (activeChatRoom === chat.room) {
        setActiveChatRoom(null);
        navigate('/');
      }
    } catch (error) {
      setErrorMessage(error.message);
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

  // Update chat list with latest content and time info on incoming messages, and sort it
  /* 
  Also mark the chat as not deleted, which ensures the chat is added for the
  recipient if they had it marked as deleted
  */
  useEffect(() => {
    if (socket) {
      const handleChatListUpdate = (chatListData, eventType) => {
        setChatList((prevChatList) =>
          prevChatList
            .map((chat) =>
              chat.room === chatListData.room
                ? {
                    ...chat,
                    last_message_content: chatListData.lastMessageContent,
                    last_message_time: chatListData.lastMessageTime,
                    // Only add user_deleted if the eventType is update-chat-list
                    ...(eventType === 'update-chat-list' && {
                      user_deleted: chatListData.userDeleted,
                      read: activeChatRoom !== chat.room ? false : true,
                    }),
                  }
                : chat
            )
            .sort((a, b) => {
              const timeA = a.last_message_time
                ? new Date(a.last_message_time)
                : null;
              const timeB = b.last_message_time
                ? new Date(b.last_message_time)
                : null;
              return timeB - timeA;
            })
        );
      };
      socket.on('update-chat-list', (data) =>
        handleChatListUpdate(data, 'update-chat-list')
      );
      socket.on('last-message-updated', (data) =>
        handleChatListUpdate(data, 'last-message-updated')
      );

      return () => {
        socket.off('update-chat-list');
        socket.off('last-message-updated');
      };
    }
  }, [setChatList, socket, activeChatRoom]);

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
        <div className='error-message' style={{ margin: '10px 0px 10px 0px' }}>
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
              onDeleteClick={(event) => handleChatDelete(event, chat)}
            />
          ))
      )}
    </div>
  );
}
