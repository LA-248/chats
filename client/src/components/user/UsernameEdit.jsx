import { useContext, useState } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { updateUsername } from '../../api/user-api';
import { toast } from 'sonner';
import Modal from '../common/ModalTemplate';

export default function UsernameEdit({
	isModalOpen,
	setIsModalOpen,
	errorMessage,
	setErrorMessage,
}) {
	const { loggedInUsername, setLoggedInUsername } = useContext(UserContext);
	const [usernameInput, setUsernameInput] = useState('');

	const handleFormSubmit = async (event) => {
		event.preventDefault();

		if (!usernameInput) {
			throw new Error('Please enter a username');
		} else if (usernameInput.length < 2) {
			throw new Error('Username must contain at least 2 characters');
		} else if (usernameInput === loggedInUsername) {
			setIsModalOpen(false);
			return;
		}

		toast.promise(updateUsername(usernameInput), {
			loading: 'In progress...',
			success: () => {
				return 'Username changed successfully';
			},
			error: (error) => error.message,
		});
    setLoggedInUsername(usernameInput);
		setIsModalOpen(false);
	};

	return (
		<>
			<div className='username-container'>
				<div className='username-heading'>Username</div>
				<div className='username-input-wrapper'>
					<input
						className='username-display'
						placeholder={loggedInUsername}
						disabled={true}
					/>
					<button
						className='edit-username-button'
						onClick={() => setIsModalOpen(true)}
					>
						Edit
					</button>
				</div>
			</div>

			<Modal
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				errorMessage={errorMessage}
				setErrorMessage={setErrorMessage}
			>
				<div className='modal-heading'>Edit username</div>
				<form id='username-edit-form' onSubmit={handleFormSubmit}>
					<input
						autoFocus
						className='username-input'
						placeholder='Choose a new username'
						value={usernameInput}
						onChange={(event) => {
							setUsernameInput(event.target.value);
							setErrorMessage('');
						}}
					/>
					<div className='modal-action-buttons-container'>
						<button
							type='submit'
							className='confirm-username-edit-button'
							style={{ marginTop: '20px' }}
						>
							Done
						</button>
						<button
							type='button'
							className='close-modal-button'
							style={{ marginTop: '20px' }}
							onClick={() => setIsModalOpen(false)}
						>
							Close
						</button>
					</div>
				</form>
			</Modal>
		</>
	);
}
