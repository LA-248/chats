import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageContext } from './MessageContext';

export default function ChatList({ userId, setSelectedChat, setUsername }) {
  const { activeChatId, setActiveChatId, chatList, setChatList } = useContext(MessageContext);
  const navigate = useNavigate();
  const storedChat = JSON.parse(localStorage.getItem('chat-list'));

  // Remove a conversation from the chat list
  const removeObjectById = (id) => {
    const updatedChatList = storedChat.filter(chat => chat.id !== id);
    setChatList(updatedChatList);
    localStorage.setItem('chat-list', JSON.stringify(updatedChatList));
  };

  const displayChatDeleteButton = (event) => {
    const chatDeleteButton = event.target.querySelector('.chat-delete-button');
    if (chatDeleteButton) {
      chatDeleteButton.style.display = 'block';
    }
  };

  const removeChatDeleteButton = (event) => {
    const chatDeleteButton = event.target.querySelector('.chat-delete-button');
    if (chatDeleteButton) {
      chatDeleteButton.style.display = 'none';
    }
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
              onMouseEnter={displayChatDeleteButton}
              onMouseLeave={removeChatDeleteButton}
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
              <button
                onClick={(event) => {
                  // Prevent the click event from also triggering the onClick event of the parent chat item
                  event.stopPropagation();
                  removeObjectById(chat.id);
                }}
                className="chat-delete-button"
                style={{ display: 'none' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
