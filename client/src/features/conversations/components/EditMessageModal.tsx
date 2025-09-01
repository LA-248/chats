import { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MessageContext } from '../../../contexts/MessageContext';
import { editMessageById } from '../../../api/message-api';
import { useSocket } from '../../../hooks/useSocket';
import Modal from '../../../components/ModalTemplate';
import { ChatContext } from '../../../contexts/ChatContext';

interface EditMessageModalProps {
  chatType: string;
  messageId: number | null;
  messageIndex: number | null;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  errorMessage: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
}

export default function EditMessageModal({
  chatType,
  messageId,
  messageIndex,
  isModalOpen,
  setIsModalOpen,
  errorMessage,
  setErrorMessage,
}: EditMessageModalProps) {
  const socket = useSocket();
  const { room } = useParams();
  const { chatId } = useContext(ChatContext);
  const { currentMessage, filteredMessages, newMessage, setNewMessage } =
    useContext(MessageContext);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);

  const handleMessageEdit = async (
    messageId: number | null,
    messageIndex: number | null
  ): Promise<void> => {
    try {
      if (!socket) return;

      if (!newMessage) {
        setIsModalOpen(false);
        return;
      }
      // Update the database with the edited message
      if (chatId) {
        await editMessageById(chatType, chatId, newMessage, messageId);
      }

      const messageList = [...filteredMessages];
      const isLastMessage = messageIndex === messageList.length - 1;
      if (isLastMessage) {
        socket.emit('last-message-updated', { room, chatType });
      }
      // Emit event to notify the server of message deletion and update the message list for everyone in the room
      socket.emit('message-list-update-event', room, 'editing');

      setNewMessage('');
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
        <div className='modal-heading'>Edit message</div>
        <div>
          <textarea
            autoFocus
            id='message-edit-textarea'
            placeholder={currentMessage}
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            style={{ width: '100%' }}
          />
          <button
            type='button'
            className='emoji-picker-button-edit-modal'
            onClick={(event) => {
              event.stopPropagation();
              setShowEmojiPicker((value) => !value);
            }}
            style={{ color: showEmojiPicker ? '#1db954' : 'white' }}
          >
            {showEmojiPicker ? 'Close' : 'Emoji menu'}
          </button>
        </div>

        {showEmojiPicker ? (
          <div className='emoji-picker-container'></div>
        ) : null}

        <div className='modal-action-buttons-container'>
          <button
            className='confirm-action-button'
            style={{ backgroundColor: '#1db954' }}
            onClick={() => handleMessageEdit(messageId, messageIndex)}
          >
            Save
          </button>

          <button
            className='close-modal-button'
            onClick={() => {
              setNewMessage('');
              setIsModalOpen(false);
            }}
          >
            Cancel
          </button>
        </div>
      </Modal>
    </>
  );
}
