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
import AddGroupMembers from './AddGroupMembers';

export default function ContactHeader({ room }) {
	const navigate = useNavigate();
	const location = useLocation();
	const chatType = location.pathname.split('/')[1];
	const isPrivateChat = chatType === 'chats';

	const { setIsBlocked } = useContext(UserContext);
	const { setChatId, setChatList, groupPicture, setGroupPicture } =
		useContext(ChatContext);
	const { activeChatInfo, setActiveChatInfo, setActiveChatRoom } =
		useContext(ChatContext);
	const { messages, setFilteredMessages } = useContext(MessageContext);
	const { loggedInUsername, loggedInUserId } = useContext(UserContext);

	const [chatName, setChatName] = useState('');
	const [privateChatPicture, setPrivateChatPicture] = useState(null);
	const [isChatInfoModalOpen, setIsChatInfoModalOpen] = useState(false);
	const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	useClearErrorMessage(errorMessage, setErrorMessage);

	useEffect(() => {
		const fetchChatInfo = async () => {
			try {
				const chatInfo = isPrivateChat
					? await getRecipientInfo(room, navigate)
					: await getGroupChatInfo(room, navigate);

				const loggedInUserBlockList = await getBlockList();
				setIsBlocked(
					isPrivateChat ? loggedInUserBlockList.includes(chatInfo.userId) : null
				);

				setActiveChatInfo(chatInfo);
				setChatName(isPrivateChat ? chatInfo.username : chatInfo.info.name);
				setChatId(isPrivateChat ? chatInfo.userId : chatInfo.info.chatId);
				setActiveChatRoom(room);
				isPrivateChat
					? setPrivateChatPicture(chatInfo.profilePicture)
					: setGroupPicture(chatInfo.info.groupPicture);
			} catch (error) {
				setErrorMessage(error.message);
			}
		};

		fetchChatInfo();
	}, [
		room,
		chatType,
		navigate,
		setIsBlocked,
		setActiveChatInfo,
		setChatId,
		setActiveChatRoom,
		setGroupPicture,
		isPrivateChat,
	]);

	return (
		<div>
			<div className='contact-header-container'>
				<div className='contact-header'>
					<div className='picture-and-name'>
						<img
							className='chat-pic'
							src={
								(isPrivateChat ? privateChatPicture : groupPicture) ||
								'/images/default-avatar.jpg'
							}
							alt='Profile avatar'
							style={{ height: '35px', width: '35px' }}
						></img>
						<div>
							<div
								className='chat-name-contact-header'
								onClick={() => setIsChatInfoModalOpen(true)}
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

					<div className='group-chat-action-buttons'>
						{chatType === 'groups' ? (
							<button
								className='add-group-members-button'
								onClick={() => setIsAddMembersModalOpen(true)}
							>
								Add members
							</button>
						) : null}
						<MessageSearch
							messages={messages}
							setFilteredMessages={setFilteredMessages}
						/>
					</div>
				</div>
			</div>

			<AddGroupMembers
				isModalOpen={isAddMembersModalOpen}
				setIsModalOpen={setIsAddMembersModalOpen}
				activeChatInfo={activeChatInfo}
				setActiveChatInfo={setActiveChatInfo}
				loggedInUsername={loggedInUsername}
				loggedInUserId={loggedInUserId}
				setChatList={setChatList}
			/>

			{activeChatInfo && isChatInfoModalOpen && chatType === 'chats' && (
				<ContactInfoModal
					activeChat={activeChatInfo}
					isModalOpen={isChatInfoModalOpen}
					setIsModalOpen={setIsChatInfoModalOpen}
					updateBlockList={updateBlockList}
					errorMessage={errorMessage}
					setErrorMessage={setErrorMessage}
				/>
			)}
			{activeChatInfo && isChatInfoModalOpen && chatType === 'groups' && (
				<GroupInfoModal
					activeChat={activeChatInfo}
					loggedInUserId={loggedInUserId}
					loggedInUsername={loggedInUsername}
					isModalOpen={isChatInfoModalOpen}
					setIsModalOpen={setIsChatInfoModalOpen}
					errorMessage={errorMessage}
					setErrorMessage={setErrorMessage}
				/>
			)}
		</div>
	);
}
