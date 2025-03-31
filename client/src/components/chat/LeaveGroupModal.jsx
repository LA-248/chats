import { useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { toast } from 'sonner';
import { leaveGroupChat } from '../../api/group-chat-api';
import { getChatListByUserId } from '../../api/private-chat-api';
import { ChatContext } from '../../contexts/ChatContext';
import Modal from '../common/ModalTemplate';

export default function LeaveGroupModal({
	activeChat,
	loggedInUserId,
	isModalOpen,
	setIsModalOpen,
}) {
	const navigate = useNavigate();
	const { setChatList } = useContext(ChatContext);
	const [errorMessage, setErrorMessage] = useState('');

	const handleLeavingGroup = async () => {
		try {
			const groupId = activeChat.info.chatId;
			const result = await leaveGroupChat(groupId, loggedInUserId);

			// Fetch updated chat list after leaving group to reflect changes
			const updatedList = await getChatListByUserId();
			setChatList(updatedList);

			toast.success(result);
			navigate('/');
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
				<div className='modal-heading'>Leave group</div>
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
