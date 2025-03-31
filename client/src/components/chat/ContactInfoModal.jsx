import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { ChatContext } from '../../contexts/ChatContext';
import useBlockAndUnblock from '../../hooks/useBlockAndUnblock';
import Modal from '../common/ModalTemplate';

export default function ContactInfoModal({
	activeChat,
	isModalOpen,
	setIsModalOpen,
	updateBlockList,
	errorMessage,
	setErrorMessage,
}) {
	const location = useLocation();
	// Extract chat type from URL path
	const pathSegments = location.pathname.split('/');
	const chatType = pathSegments[1];

	const { recipientProfilePicture } = useContext(ChatContext);
	const { isBlocked, setIsBlocked } = useContext(UserContext);
	const { handleBlockAndUnblock } = useBlockAndUnblock({
		activeChat: activeChat,
		updateBlockList: updateBlockList,
		setIsBlocked: setIsBlocked,
		setErrorMessage: setErrorMessage,
	});

	return (
		<Modal
			isModalOpen={isModalOpen}
			setIsModalOpen={setIsModalOpen}
			errorMessage={errorMessage}
			setErrorMessage={setErrorMessage}
		>
			<div className='modal-heading'>
				{chatType === 'groups' ? 'Group info' : 'Contact info'}
			</div>
			{isBlocked ? (
				<div className='blocked-status' style={{ marginTop: '-15px' }}>
					You have this user blocked
				</div>
			) : null}

			<div className='contact-info-container'>
				<img
					className='chat-pic'
					src={recipientProfilePicture || '/images/default-avatar.jpg'}
					alt='Profile avatar'
					style={{ height: '100px', width: '100px' }}
				></img>
				<div
					className='chat-name-contact-info-modal'
					style={{ textDecoration: 'none', cursor: 'auto' }}
				>
					{chatType === 'groups' ? activeChat.info.name : activeChat.username}
				</div>
			</div>

			<div className='modal-action-buttons-container'>
				{chatType === 'chats' ? (
					<button className='block-user-button' onClick={handleBlockAndUnblock}>
						{isBlocked ? 'Unblock' : 'Block'}
					</button>
				) : null}
				<button
					className='close-modal-button'
					onClick={() => setIsModalOpen(false)}
					style={{ width: chatType === 'groups' && '100%' }}
				>
					Close
				</button>
			</div>
		</Modal>
	);
}
