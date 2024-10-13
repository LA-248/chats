import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { MessageContext } from '../contexts/MessageContext';

export default function MessageList({
  filteredMessages,
  room,
  hoveredIndex,
  setHoveredIndex,
  setIsEditModalOpen,
  setIsModalOpen,
  setMessageId,
  setMessageIndex,
  errorMessage,
}) {
  const { loggedInUserId, profilePicture } = useContext(UserContext);
  const { setCurrentMessage, messageSearchValueText } = useContext(MessageContext);
  const activeChat = JSON.parse(localStorage.getItem('active-chat'));

  return (
    <>
      {/* Only render the messages if the user is a part of the private chat */}
      {room.includes(loggedInUserId) && (
        <div className="chat-content-container">
          <div className="messages-container">
            <ul id="messages">
              {messageSearchValueText && filteredMessages.length === 0 ? (
                <div id="no-messages-state">No messages found</div>
              ) : (
                filteredMessages.map((messageData, index) => (
                  <li
                    className="individual-message"
                    key={index}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="message-container">
                      <img
                        className="message-profile-picture"
                        src={
                          loggedInUserId === messageData.senderId
                            ? profilePicture
                            : activeChat.recipient_profile_picture
                        }
                        alt="Profile"
                      ></img>
                      <div className="message-metadata">
                        <div className="message-details">
                          <div className="message-from">{messageData.from}</div>
                          <div className="message-time">
                            {messageData.eventTime}
                          </div>
                          {hoveredIndex === index &&
                          loggedInUserId === messageData.senderId ? (
                            <div className="message-actions-button">
                              <div
                                className="message-edit-button"
                                onClick={() => {
                                  setIsEditModalOpen(true);
                                  setMessageId(messageData.id);
                                  setMessageIndex(index);
                                  setCurrentMessage(messageData.content);
                                }}
                              >
                                Edit
                              </div>
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
                            </div>
                          ) : null}
                        </div>
                        <div className="message-content">
                          {messageData.content}
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
          {errorMessage ? (
            <div
              className="error-message"
              style={{ margin: "20px", textAlign: "left" }}
            >
              {errorMessage}
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
