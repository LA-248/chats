export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="chat-list">
        <div className="chat-item">
          <div className="chat-pic"></div>
          <div className="chat-info">
            <h4 className="chat-name">John Doe</h4>
            <p className="chat-last-message">Hello there!</p>
          </div>
          <div className="chat-time">12:30 PM</div>
        </div>
      </div>
    </div>
  );
}
