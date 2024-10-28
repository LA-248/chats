import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import { MessageContext } from '../../contexts/MessageContext';
import { useSocketErrorHandling } from '../../hooks/useSocketErrorHandling';
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

  useSocketErrorHandling(socket, setErrorMessage);

  useEffect(() => {
    const displayInitialMessages = (initialMessages) => {
      setMessages(initialMessages);
    };

    const handleMessageListUpdate = (updatedMessageList) => {
      setMessages(updatedMessageList);
    };

    socket.emit('join-room', room);
    // Display all messages on load when opening a chat
    socket.on('initial-messages', displayInitialMessages);
    // Update chat message list for everyone in a room after a message is deleted or edited
    socket.on('message-update-event', handleMessageListUpdate);

    return () => {
      socket.emit('leave-room', room);
      socket.off('initial-messages', displayInitialMessages);
      socket.off('message-update-event', handleMessageListUpdate);
    };
  }, [socket, room, setMessages, setErrorMessage]);

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
