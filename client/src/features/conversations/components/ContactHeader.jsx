import { useContext, useEffect, useState } from 'react';
import { useSocket } from '../../../hooks/useSocket';
import { ChatContext } from '../../../contexts/ChatContext';
import { MessageContext } from '../../../contexts/MessageContext';
import { UserContext } from '../../../contexts/UserContext';

import { getBlockList, updateBlockList } from '../../../api/user-api';
import MessageSearch from './MessageSearch';
import ContactInfoModal from './ContactInfoModal';
import GroupInfoModal from '../../groups/components/GroupInfoModal';
import useClearErrorMessage from '../../../hooks/useClearErrorMessage';
import useMembersListUpdate from '../../groups/hooks/useMembersListUpdate';
import AddGroupMembers from '../../groups/components/AddGroupMembers';

export default function ContactHeader({
  room,
  chatType,
  privateChatInfo,
  groupChatInfo,
}) {
  const socket = useSocket();
  const isPrivateChat = chatType === 'chats';

  const { setIsBlocked } = useContext(UserContext);
  const {
    setChatId,
    setChatList,
    recipientProfilePicture,
    setRecipientProfilePicture,
    groupPicture,
    setGroupPicture,
    chatName,
    setChatName,
    membersList,
    setMembersList,
  } = useContext(ChatContext);
  const { setActiveChatRoom } = useContext(ChatContext);
  const { messages, setFilteredMessages } = useContext(MessageContext);
  const { loggedInUsername, loggedInUserId } = useContext(UserContext);
  const [recipientUserId, setRecipientUserId] = useState(null);
  const [isChatInfoModalOpen, setIsChatInfoModalOpen] = useState(false);
  const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useClearErrorMessage(errorMessage, setErrorMessage);

  // Handles fetching the info of private and group chats
  useEffect(() => {
    const fetchChatInfo = async () => {
      try {
        if (isPrivateChat) {
          setRecipientUserId(privateChatInfo.userId);
          const blockList = await getBlockList();
          setIsBlocked(blockList.includes(privateChatInfo.userId));
          setChatId(privateChatInfo.userId);
          setRecipientProfilePicture(privateChatInfo.profilePicture);
        } else {
          setChatId(groupChatInfo.info.chatId);
          setGroupPicture(groupChatInfo.info.groupPicture);
          setMembersList(groupChatInfo.members);
        }

        setChatName(
          isPrivateChat ? privateChatInfo.username : groupChatInfo.info.name
        );
        setActiveChatRoom(room);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    fetchChatInfo();
  }, [
    room,
    isPrivateChat,
    privateChatInfo,
    groupChatInfo,
    setIsBlocked,
    setChatId,
    setChatName,
    setRecipientProfilePicture,
    setGroupPicture,
    setMembersList,
    setActiveChatRoom,
  ]);

  useMembersListUpdate(socket, setMembersList);

  return (
    <div>
      <div className='contact-header-container'>
        <div className='contact-header'>
          <div className='picture-and-name'>
            <img
              className='chat-pic'
              src={
                (isPrivateChat ? recipientProfilePicture : groupPicture) ||
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
              {chatType === 'groups' && groupChatInfo.members ? (
                <div className='group-member-list'>
                  {membersList
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

          <div className='chat-action-buttons'>
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
        groupId={groupChatInfo.info.chatId}
        loggedInUsername={loggedInUsername}
        loggedInUserId={loggedInUserId}
        setChatList={setChatList}
      />

      {isChatInfoModalOpen && chatType === 'chats' && (
        <ContactInfoModal
          recipientUserId={recipientUserId}
          isModalOpen={isChatInfoModalOpen}
          setIsModalOpen={setIsChatInfoModalOpen}
          updateBlockList={updateBlockList}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
        />
      )}
      {isChatInfoModalOpen && chatType === 'groups' && (
        <GroupInfoModal
          group={groupChatInfo}
          membersList={membersList}
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
