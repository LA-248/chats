import { useContext } from 'react';
import { MessageContext } from '../contexts/MessageContext';
import { editMessageById } from '../api/message-api';
import Modal from './ModalTemplate';

export default function EditMessageModal({
  messageId,
  messageIndex,
  isModalOpen,
  setIsModalOpen,
  errorMessage,
  setErrorMessage,
}) {
  const { currentMessage, filteredMessages, newMessage, setNewMessage } = useContext(MessageContext);

  const handleMessageEdit = async (messageId, messageIndex) => {
    try {
      // Update the database with the edited message
      await editMessageById(newMessage, messageId);
      // Update message list
      filteredMessages[messageIndex].content = newMessage;
    } catch (error) {
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
        <div className="modal-heading">Edit message</div>
        <textarea
          autoFocus
          type="text"
          id="message-edit-textarea"
          placeholder={currentMessage}
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
        />

        <div className="modal-action-buttons-container">
          <button
            className="confirm-action-button"
            style={{ backgroundColor: '#1db954' }}
            onClick={() => {
              handleMessageEdit(messageId, messageIndex);
              setIsModalOpen(false);
            }}
          >
            Save
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
    </>
  );
}
