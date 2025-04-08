import { useContext, useEffect, useState } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { UserContext } from '../../contexts/UserContext';
import { MessageContext } from '../../contexts/MessageContext';
import { ChatContext } from '../../contexts/ChatContext';
import { updateBlockList } from '../../api/user-api';
import { updateReadStatus } from '../../api/private-chat-api';
import ContactInfoModal from '../chat/ContactInfoModal';
import formatDate from '../../utils/DateTimeFormat';
import { useGroupChatInfo } from '../../hooks/useGroupChatInfo';
import { useLocation } from 'react-router-dom';

export default function MessageList({
  room,
  hoveredIndex,
  setHoveredIndex,
  setIsEditModalOpen,
  setIsDeleteModalOpen,
  setMessageId,
  setMessageIndex,
}) {
  const location = useLocation();
  // Extract chat type from URL path
  const pathSegments = location.pathname.split('/');
  const chatType = pathSegments[1];
  const isPrivateChat = chatType === 'chats';

  const socket = useSocket();
  const { activeChatInfo, recipientProfilePicture, chatName } =
    useContext(ChatContext);
  const { loggedInUsername, loggedInUserId, profilePicture } =
    useContext(UserContext);
  const {
    setMessages,
    setCurrentMessage,
    messageSearchValueText,
    filteredMessages,
  } = useContext(MessageContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (socket) {
      const handleMessage = async (messageData) => {
        try {
          // Append message to UI only if the user is currently in the room where the message was sent
          if (room === messageData.room) {
            setMessages((prevMessages) => prevMessages.concat(messageData));
            // If a message is received while the user has the chat open, this is needed to automatically mark the chat as read
            if (messageData.chatType === 'chats') {
              await updateReadStatus(true, room);
            }
          }
        } catch (error) {
          setErrorMessage(error.message);
        }
      };
      socket.on('chat-message', handleMessage);
      return () => socket.off('chat-message', handleMessage);
    }
  }, [room, socket, setMessages]);

  const groupMembersInfo = useGroupChatInfo(room, chatType, setErrorMessage);

  const getProfilePicture = (messageData) => {
    // Group chat
    if (!isPrivateChat) {
      const groupMember = groupMembersInfo.find(
        (member) => messageData.senderId === member.user_id
      );
      return groupMember?.profile_picture || '/images/default-avatar.jpg';
    }

    // Private chat
    if (loggedInUserId === messageData.senderId) {
      return profilePicture;
    } else {
      return (
        recipientProfilePicture ||
        activeChatInfo?.profilePicture ||
        '/images/default-avatar.jpg'
      );
    }
  };

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
                        src={getProfilePicture(messageData)}
                        alt='Profile avatar'
                      />
                    )}
                    <div className='message-metadata'>
                      <div className='message-details'>
                        <div
                          className={`message-from ${
                            loggedInUserId !== messageData.senderId &&
                            isPrivateChat
                              ? 'clickable'
                              : ''
                          }`}
                          onClick={() =>
                            loggedInUserId !== messageData.senderId &&
                            isPrivateChat
                              ? setIsModalOpen(true)
                              : null
                          }
                        >
                          {isPrivateChat
                            ? loggedInUserId !== messageData.senderId
                              ? chatName
                              : loggedInUsername
                            : messageData.from}
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
                      <div className='message-content-container'>
                        <div className='message-content'>
                          {messageData.content}
                        </div>
                        {messageData.isEdited ? (
                          <div className='message-edited-tag'>(edited)</div>
                        ) : null}
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
    </>
  );
}
