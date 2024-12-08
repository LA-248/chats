import { useContext, useEffect, useState } from 'react';
import { ChatContext } from '../../contexts/ChatContext';
import { MessageContext } from '../../contexts/MessageContext';
import { UserContext } from '../../contexts/UserContext';
import { getBlockList, updateBlockList } from '../../api/user-api';
import MessageSearch from './MessageSearch';
import ContactInfoModal from '../common/ContactInfoModal';
import useClearErrorMessage from '../../hooks/useClearErrorMessage';

export default function ContactHeader() {
  const { setIsBlocked, selectedChat, setActiveChatId } =
    useContext(ChatContext);
  const { messages, setRecipientId, setFilteredMessages } =
    useContext(MessageContext);
  const { setBlockList } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const activeChat = JSON.parse(localStorage.getItem('active-chat'));

  // Persist active chat data across page refreshes by syncing local storage with chat context values
  // Plus, fetch and set the block list, update block status
  useEffect(() => {
    const syncChatDataAndBlockStatus = async () => {
      if (activeChat) {
        setActiveChatId(activeChat.id);
        setRecipientId(activeChat.recipient_user_id);
      }

      try {
        const blockListArray = await getBlockList();
        setBlockList(blockListArray);
        setIsBlocked(blockListArray.includes(activeChat.recipient_user_id));
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    syncChatDataAndBlockStatus();
  }, [activeChat, setActiveChatId, setRecipientId, setBlockList, setIsBlocked]);

  useClearErrorMessage(errorMessage, setErrorMessage);

  const recipientProfilePicture =
    activeChat?.recipient_profile_picture || '/images/default-avatar.jpg';
  const recipientUsername = selectedChat || activeChat?.recipient_username;

  return (
    <div>
      <div className='contact-header-container'>
        <div className='contact-header'>
          <div className='picture-and-name'>
            {(selectedChat || activeChat.recipient_username) && (
              <img
                className='chat-pic'
                src={recipientProfilePicture}
                alt='Profile'
                style={{ height: '35px', width: '35px' }}
              ></img>
            )}
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

      <ContactInfoModal
        activeChat={activeChat}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        updateBlockList={updateBlockList}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </div>
  );
}
