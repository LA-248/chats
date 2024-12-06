import formatDate from '../../utils/DateTimeFormat';

export default function ChatItem({
  chat,
  isActive,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onDeleteClick,
}) {
  return (
    <div className='chat-item-container'>
      <div
        // Add the active class if the current chat's ID matches the activeChatId
        className={`chat-item ${isActive ? 'active' : ''}`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      >
        <img
          className='chat-pic'
          alt='Profile'
          src={chat.recipient_profile_picture || '/images/default-avatar.jpg'}
        ></img>
        <div className='chat-info'>
          <div className='chat-name-and-time'>
            <h4 className='chat-name'>{chat.recipient_username}</h4>
            <div className='time-and-notification-container'>
              <div className='chat-time'>
                {chat.last_message && formatDate(chat.event_time)}
              </div>
              {!isActive && chat.has_new_message ? (
                <span className='unread-message-alert'></span>
              ) : (
                (chat.hasNewMessage = false)
              )}
            </div>
          </div>
          <div className='chat-metadata-container'>
            <p className='chat-last-message'>placeholder</p>
            <div className='chat-utilities'>
              {isHovered && (
                <button onClick={onDeleteClick} className='chat-delete-button'>
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
