import { useContext, useState } from 'react';
import { ChatContext } from '../contexts/ChatContext';
import { updateChatName } from '../api/chat-api';
import { updateUsernameInMessages } from '../api/message-api';
import { updateUsername } from '../api/user-api';
import Modal from './ModalTemplate';

export default function UsernameEdit({ isModalOpen, setIsModalOpen, errorMessage, setErrorMessage }) {
  const { loggedInUsername, setLoggedInUsername } = useContext(ChatContext);
  const [usernameInput, setUsernameInput] = useState('');
  
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    try {
      if (!usernameInput) {
        throw new Error('Please enter a username');
      } else if (usernameInput.length < 2) {
        throw new Error('Username must contain at least 2 characters');
      }

      await updateUsernameInMessages(usernameInput);
      await updateUsername(usernameInput);
      await updateChatName(usernameInput);

      setLoggedInUsername(usernameInput);
      setIsModalOpen(false);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <>
      <div className="username-container">
        <div className="username-heading">Username</div>
        <div className="username-input-wrapper">
          <input
            className="username-display"
            placeholder={loggedInUsername}
            disabled={true}
          />
          <button
            className="edit-username-button"
            onClick={() => setIsModalOpen(true)}
          >
            Edit
          </button>
        </div>
      </div>

      <Modal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      >
        <div className="modal-heading">Edit username</div>
        <form id="username-edit-form" onSubmit={handleFormSubmit}>
          <input
            className="username-input"
            placeholder="Choose a new username"
            value={usernameInput}
            onChange={(event) => {
              setUsernameInput(event.target.value);
              setErrorMessage('');
            }}
          />
          <div className="modal-action-buttons-container">
            <button
              type="submit"
              className="confirm-username-edit-button"
              style={{ marginTop: '20px' }}
            >
              Done
            </button>
            <button
              type="button"
              className="close-modal-button"
              style={{ marginTop: '20px' }}
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
