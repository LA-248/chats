import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatContext } from '../../contexts/ChatContext';
import { MessageContext } from '../../contexts/MessageContext';
import { UserContext } from '../../contexts/UserContext';

import { getRecipientInfo } from '../../api/private-chat-api';
import { getBlockList, updateBlockList } from '../../api/user-api';
import MessageSearch from '../message/MessageSearch';
import ContactInfoModal from '../common/ContactInfoModal';
import useClearErrorMessage from '../../hooks/useClearErrorMessage';

export default function ContactHeader() {
  const navigate = useNavigate();
  const { room, username } = useParams();
  const { setIsBlocked } = useContext(UserContext);
  const { activeChatInfo, setActiveChatInfo, setActiveChatRoom } =
    useContext(ChatContext);
  const {
    messages,
    recipientUsername,
    setRecipientUsername,
    setRecipientId,
    setFilteredMessages,
  } = useContext(MessageContext);
  const [recipientProfilePicture, setRecipientProfilePicture] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Fetch info of a chat recipient to display in the contact header
    // Plus, get the block list of the logged in user to determine if the recipient is blocked
    const retrieveRecipientContactInfo = async () => {
      try {
        const recipientInfo = await getRecipientInfo(room, username, navigate);
        const loggedInUserBlockList = await getBlockList();
        handleRecipientInfoSuccess(recipientInfo, loggedInUserBlockList);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    const handleRecipientInfoSuccess = (
      recipientInfo,
      loggedInUserBlockList
    ) => {
      setActiveChatInfo(recipientInfo);
      setIsBlocked(loggedInUserBlockList.includes(recipientInfo.userId));
      setRecipientProfilePicture(recipientInfo.profilePicture);
      setRecipientUsername(recipientInfo.username);
      setRecipientId(recipientInfo.userId);
      setActiveChatRoom(room);
    };

    retrieveRecipientContactInfo();
  }, [
    room,
    username,
    setActiveChatInfo,
    setIsBlocked,
    setRecipientUsername,
    setRecipientId,
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
              src={recipientProfilePicture || '/images/default-avatar.jpg'}
              alt='Profile avatar'
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
