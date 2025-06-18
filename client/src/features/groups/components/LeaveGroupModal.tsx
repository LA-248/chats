import { useState } from 'react';
import { toast } from 'sonner';
import { leaveGroup } from '../../../api/group-chat-api';
import Modal from '../../../components/ModalTemplate';

export default function LeaveGroupModal({
  group,
  isModalOpen,
  setIsModalOpen,
}) {
  const [errorMessage, setErrorMessage] = useState('');

  const handleLeavingGroup = async () => {
    try {
      const groupId = group.info.chatId;
      const result = await leaveGroup(groupId);
      toast.success(result);
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
        <div className='modal-heading'>Leave group?</div>
        <div className='modal-subtext'>
          Are you sure you want to leave this group? You will no longer be able
          to access or participate in it.
        </div>

        <div className='modal-action-buttons-container'>
          <button
            className='confirm-action-button'
            style={{ backgroundColor: 'red' }}
            onClick={() => handleLeavingGroup()}
          >
            Leave
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
