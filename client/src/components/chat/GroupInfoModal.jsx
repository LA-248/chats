import Modal from '../common/ModalTemplate';

export default function GroupInfoModal({
	activeChat,
	loggedInUsername,
	isModalOpen,
	setIsModalOpen,
	errorMessage,
	setErrorMessage,
}) {
	return (
		<Modal
			isModalOpen={isModalOpen}
			setIsModalOpen={setIsModalOpen}
			errorMessage={errorMessage}
			setErrorMessage={setErrorMessage}
		>
			<div className='modal-heading'>Group info</div>

			<div className='group-info-container'>
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
				<div
					style={{ textDecoration: 'none', cursor: 'auto', fontSize: '13px' }}
				>
					Group - {activeChat.membersInfo.length} members
				</div>
				<hr
					style={{ width: '100%', border: 'solid 1px gray', margin: '10px' }}
				></hr>
				<div className='group-member-list-container'>
					{activeChat.membersInfo.map((member) => {
						return (
							<div className='group-member' key={member.username}>
								<img
									className='group-member-profile-picture'
									src={member.profile_picture ?? '/images/default-avatar.jpg'}
									alt='Profile avatar'
								/>
								<div>
									{loggedInUsername === member.username
										? 'You'
										: member.username}
								</div>
							</div>
						);
					})}
				</div>
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
		</Modal>
	);
}
