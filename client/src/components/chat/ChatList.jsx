import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import { ChatContext } from '../../contexts/ChatContext';
import {
  getChatListByUserId,
  deletePrivateChat,
  updateReadStatus,
} from '../../api/private-chat-api';
import ChatItem from './ChatItem';
import useClearErrorMessage from '../../hooks/useClearErrorMessage';
import useChatUpdates from '../../hooks/useChatUpdates';
import useAddGroupToChatList from '../../hooks/useAddGroupToChatList';
import { useSocketErrorHandling } from '../../hooks/useSocketErrorHandling';
import { deleteGroupChat, markUserAsRead } from '../../api/group-chat-api';

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

  // Remove a conversation from the chat list
  const handleChatDelete = async (event, chat) => {
    event.stopPropagation();
    try {
      // TODO: this is dogshit logic, clean it up
      if (chat.chat_id.includes('p')) {
        await deletePrivateChat(chat.room);
      } else {
        await deleteGroupChat(chat.room);
      }
      // Mark chat as deleted in local chat list state
      const updatedChatList = chatList.map((chatItem) => {
        if (chatItem.room === chat.room) {
          return { ...chatItem, deleted: true };
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

  /* 
  Update chat list with latest content and time info on incoming messages, and sort it
  Also mark the chat as not deleted, which ensures the chat is added for the -
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
                    // Only add deleted if the eventType is update-chat-list
                    ...(eventType === 'update-chat-list' && {
                      deleted: chatListData.deleted,
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

  // When a user is added to a group chat, notify them and add it to their chat list
  useAddGroupToChatList(socket, setChatList);

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

  // Update the profile picture of a private chat recipient when changed
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
