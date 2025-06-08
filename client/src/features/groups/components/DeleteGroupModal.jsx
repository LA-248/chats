import { useState } from 'react';
import { toast } from 'sonner';
import { permanentlyDeleteGroup } from '../../../api/group-chat-api';
import Modal from '../../../components/ModalTemplate';

export default function DeleteGroupModal({
  group,
  isModalOpen,
  setIsModalOpen,
}) {
  const [errorMessage, setErrorMessage] = useState('');

  const handleGroupDeletion = async () => {
    try {
      const groupId = group.info.chatId;
      const result = await permanentlyDeleteGroup(groupId);
      toast.success(result);
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
        <div className='modal-heading'>Delete group?</div>
        <div className='modal-subtext'>
          Are you sure you want to permanently delete{' '}
          <strong>{group.info.name}</strong>? All members will automatically be
          removed.
        </div>
        <div className='modal-subtext'>This action cannot be undone.</div>

        <div className='modal-action-buttons-container'>
          <button
            className='confirm-action-button'
            style={{ backgroundColor: 'red' }}
            onClick={() => handleGroupDeletion()}
          >
            Delete
          </button>

          <button
            className='close-modal-button'
            onClick={() => {
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
