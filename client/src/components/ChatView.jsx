import { useContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { MessageContext } from '../contexts/MessageContext';
import { useChatRoomEvents } from '../hooks/useChatRoomEvents';
import ContactHeader from './ContactHeader';
import MessageInput from './MessageInput';
import handleModalOutsideClick from '../utils/ModalOutsideClick';
import MessageList from './MessageList';
import DeleteMessageModal from './DeleteMessageModal';
import EditMessageModal from './EditMessageModal';

function ChatView() {
  const { filteredMessages, setMessages } = useContext(MessageContext);
  const { room } = useParams(); // Extract room from URL
  const socket = useSocket();
  const [messageId, setMessageId] = useState(null);
  const [messageIndex, setMessageIndex] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const modalRef = useRef();

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
        setIsEditModalOpen={setIsEditModalOpen}
        setIsModalOpen={setIsModalOpen}
        setMessageId={setMessageId}
        setMessageIndex={setMessageIndex}
        errorMessage={errorMessage}
      />

      <div className="message-form-container">
        <MessageInput />
      </div>

      <DeleteMessageModal
        messageId={messageId}
        messageIndex={messageIndex}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />

      <EditMessageModal
        messageId={messageId}
        messageIndex={messageIndex}
        isModalOpen={isEditModalOpen}
        setIsModalOpen={setIsEditModalOpen}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </div>
  );
}

export { ChatView };
