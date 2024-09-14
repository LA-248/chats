import { useContext, useState } from 'react';
import { ChatContext } from '../contexts/ChatContext';
import '../styles/Settings.css';
import Modal from '../components/ModalTemplate';
import { updateUsernameById } from '../api/user-api';
import { updateChatNameById } from '../api/chat-api';
export default function Settings() {
  const { loggedInUsername, setLoggedInUsername } = useContext(ChatContext);
  const [usernameInput, setUsernameInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleUsernameEdit = async (event) => {
    event.preventDefault();

    try {
      if (!usernameInput) {
        throw new Error('Please enter a username');
      } else if (usernameInput.length < 2) {
        throw new Error('Username must contain at least 2 characters');
      }

      await updateUsernameById(usernameInput);
      await updateChatNameById(usernameInput);

      setLoggedInUsername(usernameInput);
      setIsModalOpen(false);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="settings-main-container">
      <div className="settings-header">
        <div className="settings-heading">Settings</div>
      </div>

      <div className="account-container">
        <div className="account-heading">Account</div>
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
          <form id="username-edit-form" onSubmit={handleUsernameEdit}>
            <input
              className="username-input"
              placeholder="Set a new username"
              value={usernameInput}
              onChange={(event) => {
                setUsernameInput(event.target.value);
                setErrorMessage('');
              }}
            />
            <button
              className="confirm-username-edit-button"
              style={{ marginTop: '20px' }}
            >
              Done
            </button>
          </form>
        </Modal>
      </div>
    </div>
  );
}
