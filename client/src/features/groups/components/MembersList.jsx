import PersonRemoveAlt1RoundedIcon from '@mui/icons-material/PersonRemoveAlt1Rounded';

export default function MembersList({
  membersList,
  loggedInUsername,
  loggedInUserId,
  setIsRemoveMemberModalOpen,
  setMemberId,
  setMemberName,
}) {
  let isMemberAdmin;

  // Check if current logged in user is the group admin
  for (let member of membersList) {
    if (member.user_id === loggedInUserId) {
      member.role === 'owner'
        ? (isMemberAdmin = true)
        : (isMemberAdmin = false);
    }
  }

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

              {isMemberAdmin ? (
                // Displays the kick button next to every member that is not the group owner
                member.role !== 'owner' ? (
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
