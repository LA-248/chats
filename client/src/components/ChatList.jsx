import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageContext } from './MessageContext';
import sortChatList from '../utils/SortChatList';

export default function ChatList({ userId, setSelectedChat, setUsername, chatSearchInputText, setChatSearchInputText }) {
  const { chatList, setChatList } = useContext(MessageContext);
  const [filteredChats, setFilteredChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [hoverChatId, setHoverChatId] = useState(null);
  const navigate = useNavigate();

  // Remove a conversation from the chat list
  const removeChat = (id) => {
    const storedChat = JSON.parse(localStorage.getItem('chat-list'));
    const updatedChatList = storedChat.filter((chat) => chat.id !== id);
    setChatList(updatedChatList);
    localStorage.setItem('chat-list', JSON.stringify(updatedChatList));
  };

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

  // Sort the chat list by most recently active
  useEffect(() => {
    sortChatList(setChatList);
  }, [setChatList]);

  return (
    <div className="chat-list">
      {filteredChats
        .filter((chat) => chat.userId === userId)
        .map((chat) => (
          <div className="chat-item-container" key={chat.id}>
            <div
              // Add the active class if the current chat's ID matches the activeChatId
              className={`chat-item ${chat.id === activeChatId ? 'active' : ''}`}
              key={chat.id}
              onMouseEnter={() => setHoverChatId(chat.id)}
              onMouseLeave={() => setHoverChatId(null)}
              onClick={() => {
                setActiveChatId(chat.id);
                setSelectedChat(chat.name);
                setUsername(chat.name);

                chat.hasNewMessage = false;
                const updatedChatList = [...chatList];
                setChatList(updatedChatList);
                localStorage.setItem('chat-list', JSON.stringify(updatedChatList));

                navigate(`/messages/${chat.room}`);
              }}
            >
              <div className="chat-pic"></div>
              <div className="chat-info">
                <div className="chat-name-and-time">
                  <h4 className="chat-name">{chat.name}</h4>
                  <div className="time-and-notification-container">
                    <div className="chat-time">{chat.time}</div>
                    {activeChatId !== chat.id && chat.hasNewMessage ? (
                      <span className="unread-message-alert"></span>
                    ) : (
                      (chat.hasNewMessage = false)
                    )}
                  </div>
                </div>
                <div className="chat-metadata-container">
                  <p className="chat-last-message">{chat.lastMessage.content ? chat.lastMessage.content : chat.lastMessage}</p>
                  <div className="chat-utilities">
                    {hoverChatId === chat.id && (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          removeChat(chat.id);
                          setChatSearchInputText('');
                          if (activeChatId === chat.id) {
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
