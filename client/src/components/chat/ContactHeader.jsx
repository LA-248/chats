import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChatContext } from '../../contexts/ChatContext';
import { MessageContext } from '../../contexts/MessageContext';
import { UserContext } from '../../contexts/UserContext';
import { getRecipientInfo } from '../../api/chat-api';
import { updateBlockList } from '../../api/user-api';
import MessageSearch from './MessageSearch';
import ContactInfoModal from '../common/ContactInfoModal';
import useClearErrorMessage from '../../hooks/useClearErrorMessage';

export default function ContactHeader() {
  const { room, username } = useParams();
  const {
    activeChatInfo,
    setActiveChatInfo,
    setIsBlocked,
    selectedChat,
    setActiveChatRoom,
  } = useContext(ChatContext);
  const {
    messages,
    recipientUsername,
    setRecipientUsername,
    setRecipientId,
    setFilteredMessages,
  } = useContext(MessageContext);
  const { setBlockList } = useContext(UserContext);
  const [recipientProfilePicture, setRecipientProfilePicture] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const retrieveRecipientContactInfo = async () => {
      try {
        const recipientInfo = await getRecipientInfo(room, username);
        handleRecipientInfoSuccess(recipientInfo);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    const handleRecipientInfoSuccess = (recipientInfo) => {
      setActiveChatInfo(recipientInfo);
      setBlockList(recipientInfo.blockedUsers);
      setIsBlocked(recipientInfo.blockedUsers.includes(recipientInfo.userId));
      setRecipientProfilePicture(recipientInfo.profilePicture);
      setRecipientUsername(recipientInfo.username);
      setRecipientId(recipientInfo.userId);
      setActiveChatRoom(room);
    };

    retrieveRecipientContactInfo();
  }, [
    room,
    username,
    selectedChat,
    setActiveChatInfo,
    setBlockList,
    setIsBlocked,
    setRecipientUsername,
    setRecipientId,
    setActiveChatRoom,
  ]);

  useClearErrorMessage(errorMessage, setErrorMessage);

  return (
    <div>
      <div className='contact-header-container'>
        <div className='contact-header'>
          <div className='picture-and-name'>
            <img
              className='chat-pic'
              src={recipientProfilePicture || '/images/default-avatar.jpg'}
              alt='Profile'
              style={{ height: '35px', width: '35px' }}
            ></img>
            <div
              className='recipient-username'
              onClick={() => setIsModalOpen(true)}
            >
              {recipientUsername}
            </div>
          </div>

          <MessageSearch
            messages={messages}
            setFilteredMessages={setFilteredMessages}
          />
        </div>
      </div>

      {activeChatInfo && isModalOpen && (
        <ContactInfoModal
          activeChat={activeChatInfo}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          updateBlockList={updateBlockList}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
        />
      )}
    </div>
  );
}
