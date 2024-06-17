import { useContext, useState } from 'react';
import { MessageContext } from './MessageContext';
import { SocketContext } from '../pages/home';

export default function Sidebar() {
  const [chatList, setChatList] = useState([]);
  const { username, setUsername, setSelectedChat } = useContext(MessageContext);
  const socket = useContext(SocketContext);

  const addChat = (event) => {
    event.preventDefault();

    if (username) {
      socket.emit('join-room', username);
      const newChatItem = {
        id: chatList.length + 1,
        name: username,
        lastMessage: 'Cool!',
        time: '12:30 PM',
      };
      setChatList(chatList.concat(newChatItem));
      setUsername('');
    }
  };

  return (
    <div className="sidebar">
      <div>
        <form id="username-form" action="" onSubmit={addChat}>
          <div className="username-input-container">
            <input
              id="username-input"
              type="text"
              placeholder="Enter a username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            <button className="join-room-button" style={{ marginLeft: '10px' }}>
              Start chat
            </button>
          </div>
        </form>
      </div>

      <div className="chat-list">
        {chatList.map((chat) => (
          <div
            className="chat-item"
            key={chat.id}
            onClick={() => setSelectedChat(chat.name)}
          >
            <div className="chat-pic"></div>
            <div className="chat-info">
              <h4 className="chat-name">{chat.name}</h4>
              <p className="chat-last-message">{chat.lastMessage}</p>
            </div>
            <div className="chat-time">{chat.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
