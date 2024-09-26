import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

export default function MessageList({
  filteredMessages,
  room,
  hoveredIndex,
  setHoveredIndex,
  setIsModalOpen,
  setMessageId,
  setMessageIndex,
  errorMessage,
}) {
  const { loggedInUserId } = useContext(UserContext);

  return (
    <>
      {/* Only render the messages if the user is a part of the private chat */}
      {room.includes(loggedInUserId) && (
        <div className="chat-content-container">
          <div className="messages-container">
            <ul id="messages">
              {filteredMessages.map((messageData, index) => (
                <li
                  className="individual-message"
                  key={index}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="message-container">
                    <div className="message-metadata">
                      <div className="message-from">{messageData.from}</div>
                      <div className="message-time">
                        {messageData.eventTime}
                      </div>
                      {hoveredIndex === index &&
                      loggedInUserId === messageData.senderId ? (
                        <div
                          className="message-delete-button"
                          onClick={() => {
                            setIsModalOpen(true);
                            setMessageId(messageData.id);
                            setMessageIndex(index);
                          }}
                        >
                          Delete
                        </div>
                      ) : null}
                    </div>
                    <div className="message-content">{messageData.message}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {errorMessage ? (
            <div
              className="error-message"
              style={{ margin: '20px', textAlign: 'left' }}
            >
              {errorMessage}
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
