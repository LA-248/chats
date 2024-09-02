import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { ChatContext } from '../contexts/ChatContext';
import { getChatListByUserId, deleteChat } from '../api/chat-api';

export default function ChatList({ setSelectedChat, setUsername, chatSearchInputText, setChatSearchInputText }) {
  const socket = useSocket();
  const { chatList, setChatList } = useContext(ChatContext);
  const [filteredChats, setFilteredChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [hoverChatId, setHoverChatId] = useState(null);
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
    await deleteChat(id);
    const storedChatList = await getChatListByUserId();
    const updatedChatList = storedChatList.filter((chat) => chat.id !== id);
    setChatList(updatedChatList);
  };

  // Retrieve the user's chat list for display
  useEffect(() => {
    const displayChatList = async () => {
      const result = await getChatListByUserId();
      setChatList(result);
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

  return (
    <div className="chat-list">
      {filteredChats.map((chat) => (
        <div className="chat-item-container" key={chat.chat_id}>
          <div
            // Add the active class if the current chat's ID matches the activeChatId
            className={`chat-item ${chat.chat_id === activeChatId ? 'active' : ''}`}
            key={chat.chat_id}
            onMouseEnter={() => setHoverChatId(chat.chat_id)}
            onMouseLeave={() => setHoverChatId(null)}
            onClick={async () => {
              setActiveChatId(chat.chat_id);
              setSelectedChat(chat.name);
              setUsername(chat.name);

              // When opening a chat, if it has a new message(s), send the updated hasNewMessage status to the server
              handleMessageReadStatusUpdate(chat);

              navigate(`/messages/${chat.room}`);
            }}
          >
            <div className="chat-pic"></div>
            <div className="chat-info">
              <div className="chat-name-and-time">
                <h4 className="chat-name">{chat.name}</h4>
                <div className="time-and-notification-container">
                  <div className="chat-time">{chat.timestamp}</div>
                  {activeChatId !== chat.chat_id && chat.has_new_message ? (
                    <span className="unread-message-alert"></span>
                  ) : (
                    (chat.hasNewMessage = false)
                  )}
                </div>
              </div>
              <div className="chat-metadata-container">
                <p className="chat-last-message">
                  {chat.last_message.content
                    ? chat.last_message.content
                    : chat.last_message}
                </p>
                <div className="chat-utilities">
                  {hoverChatId === chat.chat_id && (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        removeChat(chat.chat_id);
                        setChatSearchInputText('');
                        if (activeChatId === chat.chat_id) {
                          navigate('/');
                        }
                      }}
                      className="chat-delete-button"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
