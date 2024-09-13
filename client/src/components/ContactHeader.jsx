import { useContext, useEffect, useRef, useState } from 'react';
import { ChatContext } from '../contexts/ChatContext';
import { getBlockList, updateBlockList } from '../api/user-api';
import clearErrorMessage from '../utils/ErrorMessageTimeout';
import handleModalOutsideClick from '../utils/ModalOutsideClick';
import Modal from './Modal';
import { MessageContext } from '../contexts/MessageContext';

export default function ContactHeader() {
  const { isBlocked, setIsBlocked, selectedChat, setActiveChatId } = useContext(ChatContext);
  const { setRecipientId } = useContext(MessageContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [blockList, setBlockList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const modalRef = useRef();
  const activeChat = JSON.parse(localStorage.getItem(('active-chat')));

  // TODO: Clean up this code
  // Persist active chat data across page refreshes by syncing local storage with chat context values
  useEffect(() => {
    setActiveChatId(activeChat.id);
    setRecipientId(activeChat.recipient_id);
  }, [setActiveChatId, activeChat.id, setRecipientId, activeChat.recipient_id]);

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
  }, [activeChat.recipient_id, setIsBlocked]);

  const handleBlockAndUnblock = async () => {
    try {
      // Handle blocking a user
      if (!blockList.includes(activeChat.recipient_id)) {
        // Add recipient id to block list array
        const updatedBlockList = [...blockList, activeChat.recipient_id];
        setBlockList(updatedBlockList);
        await updateBlockList(updatedBlockList);
        setIsBlocked(true);
      } else {
        // Handle unblocking a user - remove the recipient id from the block list array
        for (let i = 0; i < blockList.length; i++) {
          if (blockList[i] === activeChat.recipient_id) {
            blockList.splice(i, 1);
            setBlockList(blockList);
            await updateBlockList(blockList);
            setIsBlocked(false);
            return;
          }
        }
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  useEffect(() => {
    handleModalOutsideClick(modalRef, setIsModalOpen, isModalOpen);
  }, [isModalOpen]);

  // Clear error message after a certain amount of time
  useEffect(() => {
    clearErrorMessage(errorMessage, setErrorMessage);
  }, [errorMessage, setErrorMessage]);

  return (
    <div>
      <div className="contact-header-container">
        <div className="contact-header">
          <div className="picture-and-name">
            {(selectedChat || activeChat.name) && (
              <div
                className="chat-pic"
                style={{ height: '35px', width: '35px' }}
              ></div>
            )}
            <div
              className="recipient-username"
              onClick={() => setIsModalOpen(true)}
            >
              {selectedChat || activeChat.name}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      >
        <div className="modal-heading">Contact info</div>
        {isBlocked ? (
          <div className="blocked-status" style={{ marginTop: '-15px' }}>
            You have this user blocked
          </div>
        ) : null}

        <div className="contact-info-container">
          <div
            className="chat-pic"
            style={{ height: '70px', width: '70px' }}
          ></div>
          <div>{selectedChat || activeChat.name}</div>
        </div>

        <div className="modal-action-buttons-container">
          <button
            className="block-user-button"
            onClick={() => handleBlockAndUnblock()}
          >
            {isBlocked ? 'Unblock' : 'Block'}
          </button>
          <button
            className="close-modal-button"
            onClick={() => setIsModalOpen(false)}
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}
