import { useMemo, useState } from 'react';
import type { GroupInfoWithMembers, GroupMember } from '../../../types/group';
import Modal from '../../../components/ModalTemplate';
import LeaveGroupModal from './LeaveGroupModal';
import GroupPicture from './GroupPicture';
import MembersList from './MembersList';
import RemoveMemberModal from './RemoveMemberModal';
import DeleteGroupModal from './DeleteGroupModal';

interface GroupInfoHeaderProps {
  group: GroupInfoWithMembers;
  setIsLeaveModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function GroupInfoHeader({ group, setIsLeaveModalOpen }: GroupInfoHeaderProps) {
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

interface GroupInfoModalProps {
  group: GroupInfoWithMembers;
  membersList: GroupMember[];
  loggedInUserId: number;
  loggedInUsername: string;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  errorMessage: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
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
}: GroupInfoModalProps) {
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] =
    useState<boolean>(false);
  const [memberId, setMemberId] = useState<number>(0);
  const [memberName, setMemberName] = useState<string>('');

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
            Delete group
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
