import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageContext } from './MessageContext';

export default function ChatList({ chatList, userId, setSelectedChat, setUsername }) {
  const { activeChatId, setActiveChatId } = useContext(MessageContext);
  const navigate = useNavigate();
  const storedChat = JSON.parse(localStorage.getItem('chat-list'));

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
                <p className="chat-last-message">{storedChat[chat.id - 1].lastMessage}</p>
              </div>
              <div className="chat-time">{storedChat[chat.id - 1].time}</div>
            </div>
          </div>
        ))}
    </div>
  );
}
