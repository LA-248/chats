import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatContext } from '../../contexts/ChatContext';
import { toast } from 'sonner';
import { getRecipientUserIdByUsername } from '../../api/user-api';
import { addMembers, getGroupChatInfo } from '../../api/group-chat-api';
import Modal from '../common/ModalTemplate';

export default function AddGroupMembers({
	isModalOpen,
	setIsModalOpen,
	loggedInUsername,
	loggedInUserId,
}) {
	const navigate = useNavigate();
	const { room } = useParams();
	const { setActiveChatInfo } = useContext(ChatContext);
	const [inputUsername, setInputUsername] = useState('');
	const [addedMembers, setAddedMembers] = useState([]);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		setAddedMembers([]);
	}, [loggedInUserId, loggedInUsername]);

	const handleAddMember = async (event) => {
		event.preventDefault();

		try {
			if (!inputUsername) {
				throw new Error('Please enter a username');
			}
			if (addedMembers.length >= 10) {
				throw new Error('You may only add up to 10 members');
			}
			if (inputUsername === loggedInUsername) {
				throw new Error('You are already in the group');
			}

			const exists = addedMembers.some(
				(member) => member.username === inputUsername
			);
			if (exists) {
				throw new Error('This user has already been added to the group');
			}

			// Check if the user being added exists in the database, if they do, their user id is returned
			const memberUserId = await getRecipientUserIdByUsername(inputUsername);
			// Store the username, id, and group role of each added member, this is needed to add them as a group member in the database
			setAddedMembers((prevMembers) => [
				...prevMembers,
				{ username: inputUsername, userId: memberUserId, role: 'member' },
			]);
			setInputUsername('');
		} catch (error) {
			setErrorMessage(error.message);
		}
	};

	const removeMember = (memberToRemove) => {
		setAddedMembers(
			addedMembers.filter((member) => member.userId !== memberToRemove.userId)
		);
	};

	const handleAddAllMembers = async (event) => {
		event.preventDefault();

		if (addedMembers.length === 0) {
			return;
		}

		try {
			const result = await addMembers(room, addedMembers);
			setActiveChatInfo(await getGroupChatInfo(room, navigate));
			toast.success(result.message);
			setIsModalOpen(false);
		} catch (error) {
			setIsModalOpen(true);
			setErrorMessage(error.message);
		}
	};

	return (
		<Modal
			isModalOpen={isModalOpen}
			setIsModalOpen={setIsModalOpen}
			errorMessage={errorMessage}
			setErrorMessage={setErrorMessage}
		>
			<div className='modal-heading'>Add members</div>
			<div className='add-group-members-container'>
				<form id='add-group-members-form' onSubmit={handleAddMember}>
					<div className='input-button-wrapper'>
						<input
							className='add-group-members-input'
							placeholder='Username'
							value={inputUsername}
							onChange={(event) => {
								setInputUsername(event.target.value);
								setErrorMessage('');
							}}
						/>
						<button type='submit' className='add-member-button'>
							Select
						</button>
					</div>
					{addedMembers.length > 0 ? (
						<div className='added-group-members-heading'>Added:</div>
					) : null}
					<div className='added-group-members-container'>
						{addedMembers.map((addedMember, index) => (
							<div className='added-group-member' key={index}>
								<div className='added-member-username-container'>
									<div>{addedMember.username}</div>
									{addedMember.role === 'owner' ? <div>(You)</div> : null}
								</div>
								{addedMember.role === 'member' ? (
									<div
										className='remove-group-member-button'
										onClick={() => removeMember(addedMember)}
									>
										Remove
									</div>
								) : null}
							</div>
						))}
					</div>
				</form>
			</div>

			<div className='modal-action-buttons-container'>
				<form onSubmit={handleAddAllMembers}>
					<button
						className='confirm-action-button'
						disabled={addedMembers.length === 0}
						style={{
							opacity: addedMembers.length === 0 ? '0.6' : null,
							cursor: addedMembers.length === 0 && 'auto',
						}}
					>
						Add
					</button>
				</form>

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
	);
}
