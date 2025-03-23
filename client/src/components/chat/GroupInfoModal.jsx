import { useState } from 'react';
import Modal from '../common/ModalTemplate';
import LeaveGroupModal from './LeaveGroupModal';

function GroupInfoHeader({ activeChat, setIsLeaveModalOpen }) {
	return (
		<>
			<img
				className='chat-pic'
				src={activeChat.info.profilePicture ?? '/images/default-avatar.jpg'}
				alt='Group profile avatar'
				style={{ height: '100px', width: '100px' }}
			></img>
			<div
				className='chat-name-contact-info-modal'
				style={{ textDecoration: 'none', cursor: 'auto' }}
			>
				{activeChat.info.name}
			</div>
			<div style={{ textDecoration: 'none', cursor: 'auto', fontSize: '13px' }}>
				Group - {activeChat.membersInfo.length} members
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

function GroupMembersList({ members, loggedInUsername }) {
	return (
		<>
			<div className='group-member-list-container'>
				<div className='group-member-list-header'>Members</div>
				{members.map((member) => {
					return (
						<>
							<div className='group-member' key={member.username}>
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
						</>
					);
				})}
			</div>
		</>
	);
}

export default function GroupInfoModal({
	activeChat,
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
					activeChat={activeChat}
					setIsLeaveModalOpen={setIsLeaveModalOpen}
				/>
				<hr
					style={{ width: '100%', border: 'solid 1px gray', margin: '10px' }}
				></hr>
				<GroupMembersList
					members={activeChat.membersInfo}
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
				activeChat={activeChat}
				loggedInUserId={loggedInUserId}
				isModalOpen={isLeaveModalOpen}
				setIsModalOpen={setIsLeaveModalOpen}
			/>
		</Modal>
	);
}
