import { useState } from 'react';
import Modal from '../common/ModalTemplate';
import LeaveGroupModal from './LeaveGroupModal';
import GroupPicture from './GroupPicture';

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
      <div style={{ textDecoration: 'none', cursor: 'auto', fontSize: '13px' }}>
        Group - {group.members.length} members
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

function GroupMembersList({ membersList, loggedInUsername }) {
  return (
    <>
      <div className='group-member-list-container'>
        <div className='group-member-list-header'>Members</div>
        {membersList.map((member) => {
          return (
            <div className='group-member' key={member.user_id}>
              <div className='group-member-profile-pic-and-name'>
                <img
                  className='group-member-profile-picture'
                  src={member.profile_picture ?? '/images/default-avatar.jpg'}
                  alt='Profile avatar'
                />
                <div className='group-member-name'>
                  {loggedInUsername === member.username
                    ? 'You'
                    : member.username}
                </div>
              </div>
              <div className='group-member-role'>
                <div>{member.role === 'owner' ? 'Admin' : null}</div>
              </div>
            </div>
          );
        })}
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
        <GroupMembersList
          membersList={membersList}
          loggedInUsername={loggedInUsername}
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
