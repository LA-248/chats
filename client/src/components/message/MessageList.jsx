import React, { useContext, useEffect, useState } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { UserContext } from '../../contexts/UserContext';
import { MessageContext } from '../../contexts/MessageContext';
import { ChatContext } from '../../contexts/ChatContext';
import { updateBlockList } from '../../api/user-api';
import { updateReadStatus } from '../../api/chat-api';
import ContactInfoModal from '../common/ContactInfoModal';
import formatDate from '../../utils/DateTimeFormat';

export default function MessageList({
  filteredMessages,
  room,
  hoveredIndex,
  setHoveredIndex,
  setIsEditModalOpen,
  setIsDeleteModalOpen,
  setMessageId,
  setMessageIndex,
}) {
  const socket = useSocket();
  const { activeChatInfo } = useContext(ChatContext);
  const { loggedInUserId, profilePicture } = useContext(UserContext);
  const { setMessages, setCurrentMessage, messageSearchValueText } =
    useContext(MessageContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (socket) {
      const handleMessage = async (messageData) => {
        // Append message to UI only if the user is currently in the room where the message was sent
        if (room === messageData.room) {
          setMessages((prevMessages) => prevMessages.concat(messageData));
          await updateReadStatus(true, room);
        }
      };

      socket.on('chat-message', handleMessage);
      return () => socket.off('chat-message', handleMessage);
    }
  }, [room, socket, setMessages]);

  return (
    <>
      {activeChatInfo && isModalOpen && (
        <ContactInfoModal
          activeChat={activeChatInfo}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          updateBlockList={updateBlockList}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
        />
      )}

      {/* Only render the messages if the user is a part of the private chat */}
      {room.includes(loggedInUserId) && (
        <div className='chat-content-container'>
          <div className='messages-container'>
            <ul id='messages'>
              {messageSearchValueText && filteredMessages.length === 0 ? (
                <div id='no-messages-state'>No messages found</div>
              ) : (
                filteredMessages.map((messageData, index) => (
                  <li
                    className='individual-message'
                    key={index}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className='message-container'>
                      {activeChatInfo && (
                        <img
                          className='message-profile-picture'
                          src={
                            loggedInUserId === messageData.senderId
                              ? profilePicture
                              : activeChatInfo.profilePicture ||
                                '/images/default-avatar.jpg'
                          }
                          alt='Profile avatar'
                        />
                      )}
                      <div className='message-metadata'>
                        <div className='message-details'>
                          <div
                            className={`message-from ${
                              loggedInUserId !== messageData.senderId
                                ? 'clickable'
                                : ''
                            }`}
                            onClick={() =>
                              loggedInUserId !== messageData.senderId &&
                              setIsModalOpen(true)
                            }
                          >
                            {messageData.from}
                          </div>
                          <div className='message-time'>
                            {formatDate(messageData.eventTime)}
                          </div>
                          {hoveredIndex === index &&
                          loggedInUserId === messageData.senderId ? (
                            <div className='message-actions-button'>
                              <div
                                className='message-edit-button'
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
                                className='message-delete-button'
                                onClick={() => {
                                  setIsDeleteModalOpen(true);
                                  setMessageId(messageData.id);
                                  setMessageIndex(index);
                                }}
                              >
                                Delete
                              </div>
                            </div>
                          ) : null}
                        </div>
                        <div className='message-content'>
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
              className='error-message'
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
