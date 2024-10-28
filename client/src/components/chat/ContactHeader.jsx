import { useContext, useEffect, useState } from 'react';
import { ChatContext } from '../../contexts/ChatContext';
import { MessageContext } from '../../contexts/MessageContext';
import { UserContext } from '../../contexts/UserContext';
import { getBlockList, updateBlockList } from '../../api/user-api';
import clearErrorMessage from '../../utils/ClearErrorMessage';
import MessageSearch from './MessageSearch';
import ContactInfoModal from '../common/ContactInfoModal';

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
  useEffect(() => {
    if (activeChat) {
      setActiveChatId(activeChat.id);
      setRecipientId(activeChat.recipient_id);
    }
  }, [activeChat, setActiveChatId, setRecipientId]);

  useEffect(() => {
    // Gets the user's block list, updates the block state, and disables message input if the recipient is blocked
    const fetchAndSetBlockedStatus = async () => {
      try {
        const blockListArray = await getBlockList();
        setBlockList(blockListArray);
        setIsBlocked(blockListArray.includes(activeChat.recipient_id));
      } catch (error) {
        setErrorMessage(error.message);
      }
    };
    fetchAndSetBlockedStatus();
  }, [activeChat.recipient_id, setIsBlocked, setBlockList]);

  // Clear error message after a certain amount of time
  useEffect(() => {
    clearErrorMessage(errorMessage, setErrorMessage);
  }, [errorMessage, setErrorMessage]);

  return (
    <div>
      <div className='contact-header-container'>
        <div className='contact-header'>
          <div className='picture-and-name'>
            {(selectedChat || activeChat.name) && (
              <img
                className='chat-pic'
                src={
                  activeChat.recipient_profile_picture
                    ? activeChat.recipient_profile_picture
                    : '/images/default-avatar.jpg'
                }
                alt='Profile'
                style={{ height: '35px', width: '35px' }}
              ></img>
            )}
            <div
              className='recipient-username'
              onClick={() => setIsModalOpen(true)}
            >
              {selectedChat || activeChat.name}
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
