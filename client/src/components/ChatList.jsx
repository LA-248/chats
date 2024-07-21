import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageContext } from './MessageContext';

export default function ChatList({ userId, setSelectedChat, setUsername }) {
  const { activeChatId, setActiveChatId, chatList, setChatList } = useContext(MessageContext);
  const [hoverChatId, setHoverChatId] = useState(null);
  const navigate = useNavigate();
  const storedChat = JSON.parse(localStorage.getItem('chat-list'));

  // Remove a conversation from the chat list
  const removeChat = (id) => {
    const updatedChatList = storedChat.filter((chat) => chat.id !== id);
    setChatList(updatedChatList);
    localStorage.setItem('chat-list', JSON.stringify(updatedChatList));
  };

  return (
    <div className="chat-list">
      {chatList
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
                navigate(`/messages/${chat.room}`);
              }}
            >
              <div className="chat-pic"></div>
              <div className="chat-info">
                <h4 className="chat-name">{chat.name}</h4>
                <p className="chat-last-message">{chat.lastMessage}</p>
              </div>
              <div className="chat-utilities">
                <div className="chat-time">{chat.time}</div>
                {hoverChatId === chat.id && (
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      removeChat(chat.id);
                      navigate('/');
                    }}
                    className="chat-delete-button"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
