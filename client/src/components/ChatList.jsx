export default function ChatList({ chatList, userId, setSelectedChat, setUsername }) {
  return (
    <div className="chat-list">
      {chatList
        .filter((chat) => chat.userId === userId)
        .map((chat) => (
          <div
            className="chat-item"
            key={chat.id}
            onClick={() => {
              setSelectedChat(chat.name);
              setUsername(chat.name);
            }}
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
  );
}
