import { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import { MessageContext } from '../../contexts/MessageContext';
import { useChatRoomEvents } from '../../hooks/useChatRoomEvents';
import ContactHeader from './ContactHeader';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import DeleteMessageModal from '../common/DeleteMessageModal';
import EditMessageModal from '../common/EditMessageModal';

function ChatView() {
  const { filteredMessages, setMessages } = useContext(MessageContext);
  const { room } = useParams(); // Extract room from URL
  const socket = useSocket();
  const [messageId, setMessageId] = useState(null);
  const [messageIndex, setMessageIndex] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useChatRoomEvents(socket, room, setMessages, setErrorMessage);

  return (
    <div className='chat-view-container'>
      <ContactHeader />

      <MessageList
        filteredMessages={filteredMessages}
        room={room}
        hoveredIndex={hoveredIndex}
        setHoveredIndex={setHoveredIndex}
        setIsEditModalOpen={setIsEditModalOpen}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        setMessageId={setMessageId}
        setMessageIndex={setMessageIndex}
      />

      <div className='message-form-container'>
        <MessageInput />
      </div>

      <DeleteMessageModal
        messageId={messageId}
        messageIndex={messageIndex}
        isModalOpen={isDeleteModalOpen}
        setIsModalOpen={setIsDeleteModalOpen}
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
