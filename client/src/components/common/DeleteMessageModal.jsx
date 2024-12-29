import { useParams } from 'react-router-dom';
import { deleteMessageById } from '../../api/message-api';
import { useSocket } from '../../hooks/useSocket';
import { useContext } from 'react';
import { MessageContext } from '../../contexts/MessageContext';
import Modal from './ModalTemplate';
import { updateLastMessageId } from '../../api/chat-api';

export default function DeleteMessageModal({
  messageId,
  messageIndex,
  isModalOpen,
  setIsModalOpen,
  errorMessage,
  setErrorMessage,
}) {
  const socket = useSocket();
  const { room } = useParams();
  const { filteredMessages } = useContext(MessageContext);

  const handleMessageDelete = async (messageId, messageIndex) => {
    try {
      const messageList = [...filteredMessages];
      const isLastMessage = messageIndex === messageList.length - 1;

      await deleteMessageById(messageId);

      // Update chat list in real-time after most recent message is deleted
      // If last remaining message is deleted, ensure last message id in private chat table is null
      if (messageList.length === 1) {
        await updateLastMessageId(null, room);
        socket.emit('last-message-deleted', room);
      }
      if (isLastMessage && messageList.length > 1) {
        const newLastMessageIndex = messageList.length - 2;
        const newLastMessageId = messageList[newLastMessageIndex].id;

        // Update the private chat table to reflect the correct ID of the last sent message after deletion
        await updateLastMessageId(newLastMessageId, room);

        socket.emit('last-message-deleted', room);
      }
      // Emit event to notify the server of message deletion and update the message list for everyone in the room
      socket.emit('message-list-update-event', room, 'deleting');

      setIsModalOpen(false);
    } catch (error) {
      setIsModalOpen(true);
      setErrorMessage(error.message);
    }
  };

  return (
    <>
      <Modal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      >
        <div className='modal-heading'>Delete message</div>
        <div className='modal-subtext'>
          Are you sure you want to delete this message? It will be deleted for
          everyone.
        </div>

        <div className='modal-action-buttons-container'>
          <button
            className='confirm-action-button'
            style={{ backgroundColor: 'red' }}
            onClick={() => handleMessageDelete(messageId, messageIndex)}
          >
            Delete
          </button>

          <button
            className='close-modal-button'
            onClick={() => {
              setIsModalOpen(false);
            }}
          >
            Close
          </button>
        </div>
      </Modal>
    </>
  );
}
