import { useContext, useEffect, useState } from 'react';
import { ChatContext } from '../contexts/ChatContext';
import { MessageContext } from '../contexts/MessageContext';
import { getBlockList, updateBlockList } from '../api/user-api';
import clearErrorMessage from '../utils/ErrorMessageTimeout';

export default function ContactHeader() {
  const { isBlocked, setIsBlocked, selectedChat } = useContext(ChatContext);
  const { recipientId } = useContext(MessageContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [blockList, setBlockList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Gets the user's block list, updates the block state, and disables message input if the recipient is blocked
    const fetchAndSetBlockedStatus = async () => {
      try {
        const blockListArray = await getBlockList();
        setBlockList(blockListArray);
        setIsBlocked(blockListArray.includes(recipientId));
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    fetchAndSetBlockedStatus();
  }, [recipientId, setIsBlocked]);

  const handleBlockAndUnblock = async () => {
    try {
      // Handle blocking a user
      if (!blockList.includes(recipientId)) {
        // Add recipient id to block list array
        const updatedBlockList = [...blockList, recipientId];
        setBlockList(updatedBlockList);
        await updateBlockList(updatedBlockList);
        setIsBlocked(true);
      } else {
        // Handle unblocking a user - remove the recipient id from the block list array
        for (let i = 0; i < blockList.length; i++) {
          if (blockList[i] === recipientId) {
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

  // Clear error message after a certain amount of time
  useEffect(() => {
    clearErrorMessage(errorMessage, setErrorMessage);
  }, [errorMessage, setErrorMessage]);

  return (
    <div>
      <div className="contact-header-container">
        <div className="contact-header">
          <div className="picture-and-name">
            {selectedChat && (
              <div
                className="chat-pic"
                style={{ height: '35px', width: '35px' }}
              ></div>
            )}
            <div
              className="recipient-username"
              onClick={() => setIsModalOpen(true)}
            >
              {selectedChat}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen ? (
        <div className="contact-modal-overlay">
          <div className="contact-modal-content">
            <div className="contact-modal-heading">Contact info</div>
            {isBlocked ? (
              <div className="blocked-status">You have this user blocked</div>
            ) : null}

            <div className="contact-info-container">
              <div
                className="chat-pic"
                style={{ height: '70px', width: '70px' }}
              ></div>
              <div>{selectedChat}</div>
            </div>

            <button
              className="block-user-button"
              onClick={() => handleBlockAndUnblock()}
            >
              {isBlocked ? 'Unblock' : 'Block'}
            </button>

            <button
              className="close-contact-info-modal-button"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>

            {errorMessage ? (
              <div className="error-message">{errorMessage}</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
