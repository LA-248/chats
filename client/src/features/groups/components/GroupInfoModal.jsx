import { useMemo, useState } from 'react';
import Modal from '../../../components/ModalTemplate';
import LeaveGroupModal from './LeaveGroupModal';
import GroupPicture from './GroupPicture';
import MembersList from './MembersList';
import RemoveMemberModal from './RemoveMemberModal';
import DeleteGroupModal from './DeleteGroupModal';

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false);
  const [memberId, setMemberId] = useState(null);
  const [memberName, setMemberName] = useState('');

  const isMemberAdmin = useMemo(() => {
    return membersList.some(
      (member) => member.user_id === loggedInUserId && member.role === 'owner'
    );
  }, [membersList, loggedInUserId]);

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
          setIsRemoveMemberModalOpen={setIsRemoveMemberModalOpen}
          setMemberId={setMemberId}
          setMemberName={setMemberName}
        />
      </div>

      {isMemberAdmin ? (
        <div className='delete-group-container'>
          <button
            className='delete-group-button'
            onClick={() => setIsDeleteModalOpen(true)}
            style={{ width: '100%' }}
          >
            Delete
          </button>
        </div>
      ) : null}

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
        isModalOpen={isLeaveModalOpen}
        setIsModalOpen={setIsLeaveModalOpen}
      />

      <DeleteGroupModal
        group={group}
        isModalOpen={isDeleteModalOpen}
        setIsModalOpen={setIsDeleteModalOpen}
      />

      <RemoveMemberModal
        group={group}
        isModalOpen={isRemoveMemberModalOpen}
        setIsModalOpen={setIsRemoveMemberModalOpen}
        memberId={memberId}
        memberName={memberName}
      />
    </Modal>
  );
}
