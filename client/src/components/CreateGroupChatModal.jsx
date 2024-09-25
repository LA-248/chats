import { useState } from 'react';
import { getRecipientUserIdByUsername } from '../api/user-api';
import Modal from './ModalTemplate';

export default function CreateGroupChatModal({ isModalOpen, setIsModalOpen, loggedInUsername }) {
  const [groupName, setGroupName] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const [addedMembers, setAddedMembers] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAddMember = async (event) => {
    event.preventDefault();

    try {
      if (!inputUsername) {
        throw new Error('Please enter a username');
      }
      if (addedMembers.length >= 10) {
        throw new Error('You may only add up to 10 members');
      }
      if (inputUsername === loggedInUsername) {
        throw new Error('You may not add yourself');
      }
      // Check if the user trying to be added exists in the database
      await getRecipientUserIdByUsername(inputUsername);

      // If the user has already been added to the group, throw an error
      const exists = addedMembers.some((member) => member === inputUsername);
      if (exists) {
        throw new Error('This user has already been added to the group');
      }

      setAddedMembers((prevMembers) => prevMembers.concat(inputUsername));
      setInputUsername('');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleCreateGroup = async (event) => {
    event.preventDefault();

    try {
      if (!groupName) {
        throw new Error('Please enter a name for your group');
      }
      if (addedMembers.length === 0) {
        throw new Error('You must add at least one member to your group');
      }

      // await addGroupChat(groupName, addedMembers);
      setIsModalOpen(false);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // Remove an added member
  const removeMember = (itemToRemove) => {
    setAddedMembers(addedMembers.filter((member) => member !== itemToRemove));
  };

  return (
    <Modal
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      errorMessage={errorMessage}
      setErrorMessage={setErrorMessage}
    >
      <div className="modal-heading">Create a new group chat</div>
      <div className="set-group-name-container">
        <input
          className="set-group-name-input"
          placeholder="Group name"
          value={groupName}
          onChange={(event) => {
            setGroupName(event.target.value);
            setErrorMessage('');
          }}
        />
      </div>
      <div className="add-group-members-container">
        <div className="add-group-members-heading">Add members</div>
        <form id="add-group-members-form" onSubmit={handleAddMember}>
          <div className="input-button-wrapper">
            <input
              className="add-group-members-input"
              placeholder="Username"
              value={inputUsername}
              onChange={(event) => {
                setInputUsername(event.target.value);
                setErrorMessage('');
              }}
            />
            <button type="submit" className="add-member-button">
              Add user
            </button>
          </div>
          {addedMembers.length > 0 ? (
            <div className="added-group-members-heading">Added:</div>
          ) : null}
          <div className="added-group-members-container">
            {addedMembers.map((addedMember, index) => (
              <div className="added-group-member" key={index}>
                <div>{addedMember}</div>
                <div
                  className="remove-group-member-button"
                  onClick={() => removeMember(addedMember)}
                >
                  Remove
                </div>
              </div>
            ))}
          </div>
        </form>
      </div>

      <div className="modal-action-buttons-container">
        <form onSubmit={handleCreateGroup}>
          <button className="confirm-action-button">Create group</button>
        </form>

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
  );
}
