import { useContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { MessageContext } from '../contexts/MessageContext';
import { ChatContext } from '../contexts/ChatContext';
import { deleteMessageById } from '../api/message-api';
import { getChatListByUserId, updateChatList } from '../api/chat-api';
import { useChatRoomEvents } from '../hooks/useChatRoomEvents';
import ContactHeader from './ContactHeader';
import MessageInput from './MessageInput';
import Modal from './ModalTemplate';
import handleModalOutsideClick from '../utils/ModalOutsideClick';
import MessageList from './MessageList';

function ChatView() {
  const { filteredMessages, setMessages } = useContext(MessageContext);
  const { setChatList } = useContext(ChatContext);
  const { room } = useParams(); // Extract room from URL
  const socket = useSocket();
  const [messageId, setMessageId] = useState(null);
  const [messageIndex, setMessageIndex] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const modalRef = useRef();

  // Message deletion logic
  const handleMessageDelete = async (messageId, messageIndex) => {
    try {
      const messageList = [...filteredMessages];
      const isLastMessage = messageIndex === messageList.length - 1;
      const newLastMessage = messageList.length - 2;

      // If the message being deleted is the last one in the list (most recent message) -
      // update the chat list with the new last message's details after deletion
      if (isLastMessage && messageList.length > 1) {
        await updateChatList(
          messageList[newLastMessage].content,
          messageList[newLastMessage].eventTime,
          messageList[newLastMessage].eventTimeWithSeconds,
          room
        );
        const storedChats = await getChatListByUserId();
        setChatList(storedChats);
        // If the message being deleted is the only message in the chat, clear the chat preview's content in the chat list
      } else if (isLastMessage && messageList.length === 1) {
        await updateChatList('', '', '', room);
        const storedChats = await getChatListByUserId();
        setChatList(storedChats);
      }

      // Delete the message from the database and update the message list state
      await deleteMessageById(messageId);
      messageList.splice(messageIndex, 1);

      // Emit event to notify the server of message deletion and update the message list for everyone in the room
      socket.emit('message-delete-event', room);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  useChatRoomEvents(socket, room, setMessages, setErrorMessage);

  useEffect(() => {
    handleModalOutsideClick(modalRef, setIsModalOpen, isModalOpen);
  }, [isModalOpen]);

  return (
    <div className="chat-view-container">
      <ContactHeader />

      <MessageList
        filteredMessages={filteredMessages}
        room={room}
        hoveredIndex={hoveredIndex}
        setHoveredIndex={setHoveredIndex}
        setIsModalOpen={setIsModalOpen}
        setMessageId={setMessageId}
        setMessageIndex={setMessageIndex}
        errorMessage={errorMessage}
      />

      <div className="message-form-container">
        <MessageInput />
      </div>

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
            style={{ backgroundColor: 'red' }}
            onClick={() => {
              handleMessageDelete(messageId, messageIndex);
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
