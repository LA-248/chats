import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { deleteMessageById } from '../../../api/message-api';
import { useSocket } from '../../../hooks/useSocket';
import { MessageContext } from '../../../contexts/MessageContext';
import { updateLastMessageId } from '../../../api/private-chat-api';
import { updateLastGroupMessageId } from '../../../api/group-chat-api';
import Modal from '../../../components/ModalTemplate';

interface DeleteMessageModalProps {
  chatType: string;
  messageId: number | null;
  messageIndex: number | null;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  errorMessage: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
}

export default function DeleteMessageModal({
  chatType,
  messageId,
  messageIndex,
  isModalOpen,
  setIsModalOpen,
  errorMessage,
  setErrorMessage,
}: DeleteMessageModalProps) {
  const socket = useSocket();
  const { room } = useParams();
  const { filteredMessages } = useContext(MessageContext);

  const handleMessageDelete = async (
    messageId: number | null,
    messageIndex: number | null
  ): Promise<void> => {
    try {
      if (!socket || !room) return;

      const messageList = [...filteredMessages];
      const isLastMessage = messageIndex === messageList.length - 1;

      await deleteMessageById(messageId);

      // Update chat list in real-time after most recent message is deleted
      // If last remaining message is deleted, ensure last message id in private chat table is null
      if (messageList.length === 1) {
        chatType === 'chats'
          ? await updateLastMessageId(null, room)
          : await updateLastGroupMessageId(null, room);
        socket.emit('last-message-updated', { room, chatType });
      }
      if (isLastMessage && messageList.length > 1) {
        const newLastMessageIndex = messageList.length - 2;
        const newLastMessageId = messageList[newLastMessageIndex].id;

        // Update the private or group chat table to reflect the correct ID of the last sent message after deletion
        chatType === 'chats'
          ? await updateLastMessageId(newLastMessageId, room)
          : await updateLastGroupMessageId(newLastMessageId, room);

        socket.emit('last-message-updated', { room, chatType });
      }
      // Emit event to notify the server of message deletion and update the message list for everyone in the room
      socket.emit('message-list-update-event', room, 'deleting');

      setIsModalOpen(false);
    } catch (error) {
      setIsModalOpen(true);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
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
