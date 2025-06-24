import { useMemo } from 'react';
import { GroupMemberRole, type GroupMember } from '../../../types/group';
import PersonRemoveAlt1RoundedIcon from '@mui/icons-material/PersonRemoveAlt1Rounded';

interface MembersListProps {
  membersList: GroupMember[];
  loggedInUsername: string;
  loggedInUserId: number;
  setIsRemoveMemberModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setMemberId: React.Dispatch<React.SetStateAction<number>>;
  setMemberName: React.Dispatch<React.SetStateAction<string>>;
}

export default function MembersList({
  membersList,
  loggedInUsername,
  loggedInUserId,
  setIsRemoveMemberModalOpen,
  setMemberId,
  setMemberName,
}: MembersListProps) {
  // Check if current logged in user is the group admin
  const isMemberAdmin = useMemo(() => {
    return membersList.some(
      (member) =>
        member.user_id === loggedInUserId &&
        member.role === GroupMemberRole.OWNER
    );
  }, [membersList, loggedInUserId]);

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
                <div>
                  {member.role === GroupMemberRole.OWNER ? 'Admin' : null}
                </div>
              </div>

              {isMemberAdmin ? (
                // Displays the kick button next to every member that is not the group owner
                member.role !== GroupMemberRole.OWNER ? (
                  <button
                    className='remove-member-button'
                    onClick={() => {
                      setIsRemoveMemberModalOpen(true);
                      setMemberId(member.user_id);
                      setMemberName(member.username);
                    }}
                  >
                    <PersonRemoveAlt1RoundedIcon fontSize='small' />
                  </button>
                ) : null
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}
