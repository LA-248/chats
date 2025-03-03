import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChatContext } from '../../contexts/ChatContext';
import { MessageContext } from '../../contexts/MessageContext';
import { UserContext } from '../../contexts/UserContext';

import { getRecipientInfo } from '../../api/private-chat-api';
import { getGroupChatInfo } from '../../api/group-chat-api';
import { getBlockList, updateBlockList } from '../../api/user-api';
import MessageSearch from '../message/MessageSearch';
import ContactInfoModal from './ContactInfoModal';
import GroupInfoModal from './GroupInfoModal';
import useClearErrorMessage from '../../hooks/useClearErrorMessage';

export default function ContactHeader({ room, username }) {
	const navigate = useNavigate();
	const location = useLocation();
	// Extract chat type from URL path
	const pathSegments = location.pathname.split('/');
	const chatType = pathSegments[1];

	const { setIsBlocked } = useContext(UserContext);
	const { setChatId } = useContext(ChatContext);
	const { activeChatInfo, setActiveChatInfo, setActiveChatRoom } =
		useContext(ChatContext);
	const { messages, setFilteredMessages } = useContext(MessageContext);
	const { loggedInUsername, loggedInUserId } = useContext(UserContext);
	const [chatName, setChatName] = useState('');
	const [chatPicture, setChatPicture] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		// Fetch info of a private or group chat for display in the contact header
		// Plus, for private chats, get the block list of the logged in user to determine if the recipient is blocked
		const retrieveRecipientContactInfo = async () => {
			try {
				const isPrivateChat = chatType === 'chats';
				const chatInfo = isPrivateChat
					? await getRecipientInfo(room, navigate)
					: await getGroupChatInfo(room, navigate);
				const loggedInUserBlockList = await getBlockList();
				setIsBlocked(
					isPrivateChat ? loggedInUserBlockList.includes(chatInfo.userId) : null
				);
				setActiveChatInfo(chatInfo);
				// TODO: Find a better way to do the below
				setChatPicture(
					isPrivateChat ? chatInfo.profilePicture : chatInfo.info.groupPicture
				);
				setChatName(isPrivateChat ? chatInfo.username : chatInfo.info.name);
				setChatId(isPrivateChat ? chatInfo.userId : chatInfo.info.chatId);
				setActiveChatRoom(room);
			} catch (error) {
				setErrorMessage(error.message);
			}
		};

		retrieveRecipientContactInfo();
	}, [
		room,
		chatType,
		username,
		setActiveChatInfo,
		setIsBlocked,
		setChatName,
		setChatId,
		setActiveChatRoom,
		navigate,
	]);

	useClearErrorMessage(errorMessage, setErrorMessage);

	return (
		<div>
			<div className='contact-header-container'>
				<div className='contact-header'>
					<div className='picture-and-name'>
						<img
							className='chat-pic'
							src={chatPicture ?? '/images/default-avatar.jpg'}
							alt='Profile avatar'
							style={{ height: '35px', width: '35px' }}
						></img>
						<div>
							<div
								className='chat-name-contact-header'
								onClick={() => setIsModalOpen(true)}
							>
								{chatName}
							</div>
							{chatType === 'groups' &&
							activeChatInfo &&
							activeChatInfo.membersInfo ? (
								<div className='group-member-list'>
									{activeChatInfo.membersInfo
										.map((member) => {
											return loggedInUsername === member.username
												? 'You'
												: member.username;
										})
										.join(', ')}
								</div>
							) : null}
						</div>
					</div>

					<MessageSearch
						messages={messages}
						setFilteredMessages={setFilteredMessages}
					/>
				</div>
			</div>

			{activeChatInfo && isModalOpen && chatType === 'chats' && (
				<ContactInfoModal
					activeChat={activeChatInfo}
					isModalOpen={isModalOpen}
					setIsModalOpen={setIsModalOpen}
					updateBlockList={updateBlockList}
					errorMessage={errorMessage}
					setErrorMessage={setErrorMessage}
				/>
			)}
			{activeChatInfo && isModalOpen && chatType === 'groups' && (
				<GroupInfoModal
					activeChat={activeChatInfo}
					loggedInUserId={loggedInUserId}
					loggedInUsername={loggedInUsername}
					isModalOpen={isModalOpen}
					setIsModalOpen={setIsModalOpen}
					errorMessage={errorMessage}
					setErrorMessage={setErrorMessage}
				/>
			)}
		</div>
	);
}
