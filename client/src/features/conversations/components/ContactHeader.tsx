import { useContext, useEffect, useState } from 'react';
import { useSocket } from '../../../hooks/useSocket';
import { ChatContext } from '../../../contexts/ChatContext';
import { MessageContext } from '../../../contexts/MessageContext';
import { UserContext } from '../../../contexts/UserContext';

import { getBlockList, updateBlockList } from '../../../api/user-api';
import { ChatType } from '../../../types/chat';
import type { UserInfo } from '../../../types/user';
import type { GroupInfoWithMembers } from '../../../types/group';
import MessageSearch from './MessageSearch';
import ContactInfoModal from './ContactInfoModal';
import GroupInfoModal from '../../groups/components/GroupInfoModal';
import useClearErrorMessage from '../../../hooks/useClearErrorMessage';
import useMembersListUpdate from '../../groups/hooks/useMembersListUpdate';
import AddGroupMembers from '../../groups/components/AddGroupMembers';
import LocalPhoneRoundedIcon from '@mui/icons-material/LocalPhoneRounded';

interface ContactHeaderProps {
  room: string;
  chatType: string;
  privateChatInfo: UserInfo;
  groupChatInfo: GroupInfoWithMembers;
}

export default function ContactHeader({
  room,
  chatType,
  privateChatInfo,
  groupChatInfo,
}: ContactHeaderProps) {
  const socket = useSocket();
  const isPrivateChat = chatType === ChatType.PRIVATE;

  const {
    setChatId,
    recipientProfilePicture,
    setRecipientProfilePicture,
    groupPicture,
    setGroupPicture,
    chatName,
    setChatName,
    membersList,
    setMembersList,
    setActiveChatRoom,
  } = useContext(ChatContext);
  const { messages, setFilteredMessages } = useContext(MessageContext);
  const { loggedInUsername, loggedInUserId, setIsBlocked } =
    useContext(UserContext);

  const [recipientUserId, setRecipientUserId] = useState<number>(0);
  const [isChatInfoModalOpen, setIsChatInfoModalOpen] =
    useState<boolean>(false);
  const [isAddMembersModalOpen, setIsAddMembersModalOpen] =
    useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useClearErrorMessage(errorMessage, setErrorMessage);

  // Handles fetching the info of private and group chats
  useEffect(() => {
    const fetchChatInfo = async (): Promise<void> => {
      try {
        if (isPrivateChat) {
          const blockList = await getBlockList();
          const recipientId = privateChatInfo.userId;
          if (typeof recipientId === 'number') {
            setRecipientUserId(recipientId);
            setIsBlocked(blockList.includes(recipientId));
            setChatId(recipientId);
          }
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
        if (error instanceof Error) {
          setErrorMessage(error.message);
        }
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
              {chatType === ChatType.GROUP && groupChatInfo.members ? (
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
            {isPrivateChat ? (
              <button className='start-voice-call-button'>
                <LocalPhoneRoundedIcon fontSize='medium'></LocalPhoneRoundedIcon>
              </button>
            ) : null}

            {chatType === ChatType.GROUP ? (
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
      />

      {isChatInfoModalOpen && chatType === ChatType.PRIVATE && (
        <ContactInfoModal
          recipientUserId={recipientUserId}
          isModalOpen={isChatInfoModalOpen}
          setIsModalOpen={setIsChatInfoModalOpen}
          updateBlockList={updateBlockList}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
        />
      )}
      {isChatInfoModalOpen && chatType === ChatType.GROUP && (
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
