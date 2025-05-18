import { useState } from 'react';
import Modal from '../../../components/ModalTemplate';
import LeaveGroupModal from './LeaveGroupModal';
import GroupPicture from './GroupPicture';
import MembersList from './MembersList';

function GroupInfoHeader({ group, setIsLeaveModalOpen }) {
  return (
    <>
      <GroupPicture />
      <div
        className='chat-name-contact-info-modal'
        style={{ textDecoration: 'none', cursor: 'auto' }}
      >
        {group.info.name}
      </div>
      <div
        className='leave-group-button'
        onClick={() => {
          setIsLeaveModalOpen(true);
        }}
      >
        Leave group
      </div>
    </>
  );
}

export default function GroupInfoModal({
  group,
  membersList,
  loggedInUserId,
  loggedInUsername,
  isModalOpen,
  setIsModalOpen,
  errorMessage,
  setErrorMessage,
}) {
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  return (
    <Modal
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      errorMessage={errorMessage}
      setErrorMessage={setErrorMessage}
    >
      <div className='modal-heading'>Group info</div>

      <div className='group-info-container'>
        <GroupInfoHeader
          group={group}
          setIsLeaveModalOpen={setIsLeaveModalOpen}
        />
        <hr
          style={{ width: '100%', border: 'solid 1px gray', margin: '10px' }}
        ></hr>
        <MembersList
          membersList={membersList}
          loggedInUsername={loggedInUsername}
          loggedInUserId={loggedInUserId}
        />
      </div>

      <div className='modal-action-buttons-container'>
        <button
          className='close-modal-button'
          onClick={() => setIsModalOpen(false)}
          style={{ width: '100%' }}
        >
          Close
        </button>
      </div>

      <LeaveGroupModal
        group={group}
        loggedInUserId={loggedInUserId}
        isModalOpen={isLeaveModalOpen}
        setIsModalOpen={setIsLeaveModalOpen}
      />
    </Modal>
  );
}
