import { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MessageContext } from '../../../contexts/MessageContext';
import { editMessageById } from '../../../api/message-api';
import { useSocket } from '../../../hooks/useSocket';
import Modal from '../../../components/ModalTemplate';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

export default function EditMessageModal({
  chatType,
  messageId,
  messageIndex,
  isModalOpen,
  setIsModalOpen,
  errorMessage,
  setErrorMessage,
}) {
  const socket = useSocket();
  const { room } = useParams();
  const { currentMessage, filteredMessages, newMessage, setNewMessage } =
    useContext(MessageContext);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleMessageEdit = async (messageId, messageIndex) => {
    try {
      if (!newMessage) {
        setIsModalOpen(false);
        return;
      }
      // Update the database with the edited message
      await editMessageById(newMessage, messageId);

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
      setErrorMessage(error.message);
    }
  };

  const handleAddEmoji = (emoji) => {
    setNewMessage((prevMessage) => prevMessage + emoji.native);
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
            type='text'
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
          <div className='emoji-picker-container'>
            <Picker
              data={data}
              onEmojiSelect={handleAddEmoji}
              onClickOutside={() => setShowEmojiPicker(false)}
            />
          </div>
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
