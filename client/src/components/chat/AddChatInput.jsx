import { useCallback, useState } from 'react';
import { addChat } from '../../api/private-chat-api';
import useClearErrorMessage from '../../hooks/useClearErrorMessage';

export default function AddChatInput({
	chatList,
	setChatList,
	errorMessage,
	setErrorMessage,
}) {
	const [inputUsername, setInputUsername] = useState('');

	// Adds a new chat to the sidebar
	const handleAddChat = useCallback(
		async (event) => {
			event.preventDefault();

			try {
				const exists = chatList.some(
					(chat) => chat.name === inputUsername && chat.deleted === false
				);
				if (exists) {
					throw new Error('You already have an active chat with this user');
				}
				if (!inputUsername) {
					throw new Error('Please enter a username');
				}

				const response = await addChat(inputUsername);
				setChatList(response.updatedChatList);
				setInputUsername('');
			} catch (error) {
				setErrorMessage(error.message);
			}
		},
		[chatList, setChatList, inputUsername, setErrorMessage]
	);

	useClearErrorMessage(errorMessage, setErrorMessage);

	return (
		<div className='username-form-container'>
			<form id='username-form' action='' onSubmit={handleAddChat}>
				<div className='username-input-container'>
					<input
						id='username-input'
						type='text'
						placeholder='Find or start a conversation'
						value={inputUsername}
						onChange={(event) => {
							setInputUsername(event.target.value);
							setErrorMessage('');
						}}
					/>
					<button className='start-chat-button' style={{ marginLeft: '10px' }}>
						Start chat
					</button>
				</div>
				{errorMessage && (
					<div className='error-message' style={{ marginTop: '20px' }}>
						{errorMessage}
					</div>
				)}
			</form>
		</div>
	);
}
