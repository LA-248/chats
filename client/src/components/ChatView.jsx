import { useContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { MessageContext } from '../contexts/MessageContext';
import { ChatContext } from '../contexts/ChatContext';
import { getUserId } from '../api/user-api';
import { deleteMessageById } from '../api/message-api';
import ContactHeader from './ContactHeader';
import MessageInput from './MessageInput';
import Modal from './Modal';
import handleModalOutsideClick from '../utils/ModalOutsideClick';

function ChatView() {
  const { messages, setMessages } = useContext(MessageContext);
  const { setChatList } = useContext(ChatContext);
  const { room } = useParams(); // Extract room from URL
  const socket = useSocket();
  const [userId, setUserId] = useState(null);
  const [messageId, setMessageId] = useState(null);
  const [messageIndex, setMessageIndex] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const modalRef = useRef();

  // Deletes a message by id and updates the messages array state
  const handleDeleteMessage = async (messageId, messageIndex) => {
    try {
      await deleteMessageById(messageId);
      const messageList = [...messages];
      messageList.splice(messageIndex, 1);
      setMessages(messageList);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  useEffect(() => {
    const handleInitialMessages = (initialMessages) => {
      setMessages(initialMessages);
    };

    // Join the room and request messages
    socket.emit('join-room', room);

    // Display all messages on load when opening a chat
    socket.on('initial-messages', handleInitialMessages);

    return () => {
      socket.emit('leave-room', room);
      socket.off('initial-messages', handleInitialMessages);
    };
  }, [setChatList, setMessages, socket, room]);

  useEffect(() => {
    getUserId(setUserId, setErrorMessage);
  }, []);

  useEffect(() => {
    handleModalOutsideClick(modalRef, setIsModalOpen, isModalOpen);
  }, [isModalOpen]);

  return (
    <div className="chat-view-container">
      <ContactHeader />

      {/* Only render the messages if the user is a part of the private chat */}
      {room.includes(userId) && (
        <div className="chat-content-container">
          <div className="messages-container">
            <ul id="messages">
              {messages.map((messageData, index) => (
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
                      userId === messageData.senderId ? (
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
          <div className="message-form-container">
            <MessageInput setMessages={setMessages} />
          </div>
        </div>
      )}

      <Modal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      >
        <div className="modal-heading">Delete message</div>
        <div className="modal-subtext" style={{ fontSize: '14px' }}>
          Are you sure you want to delete this message? It will be deleted for
          everyone.
        </div>

        <div className="modal-action-buttons-container">
          <button
            className="confirm-action-button"
            style={{ backgroundColor: "red" }}
            onClick={() => {
              handleDeleteMessage(messageId, messageIndex);
              setIsModalOpen(false);
            }}
          >
            Delete
          </button>

          <button
            className="close-modal-button"
            onClick={() => {
              setIsModalOpen(false);
            }}
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}

export { ChatView };
