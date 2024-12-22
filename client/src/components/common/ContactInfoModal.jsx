import { useContext } from 'react';
import { ChatContext } from '../../contexts/ChatContext';
import { UserContext } from '../../contexts/UserContext';
import useBlockAndUnblock from '../../hooks/useBlockAndUnblock';
import Modal from './ModalTemplate';

export default function ContactInfoModal({
  activeChat,
  isModalOpen,
  setIsModalOpen,
  updateBlockList,
  errorMessage,
  setErrorMessage,
}) {
  const { isBlocked, setIsBlocked, selectedChat } = useContext(ChatContext);
  const { blockList, setBlockList } = useContext(UserContext);
  const { handleBlockAndUnblock } = useBlockAndUnblock({
    blockList: blockList,
    activeChat: activeChat,
    setBlockList: setBlockList,
    updateBlockList: updateBlockList,
    setIsBlocked: setIsBlocked,
    setErrorMessage: setErrorMessage,
  });

  return (
    <Modal
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      errorMessage={errorMessage}
      setErrorMessage={setErrorMessage}
    >
      <div className='modal-heading'>Contact info</div>
      {isBlocked ? (
        <div className='blocked-status' style={{ marginTop: '-15px' }}>
          You have this user blocked
        </div>
      ) : null}

      <div className='contact-info-container'>
        <img
          className='chat-pic'
          src={
            activeChat.profilePicture
              ? activeChat.profilePicture
              : '/images/default-avatar.jpg'
          }
          alt='Profile avatar'
          style={{ height: '100px', width: '100px' }}
        ></img>
        <div className='recipient-username'>
          {selectedChat || activeChat.name}
        </div>
      </div>

      <div className='modal-action-buttons-container'>
        <button
          className='block-user-button'
          onClick={handleBlockAndUnblock}
        >
          {isBlocked ? 'Unblock' : 'Block'}
        </button>
        <button
          className='close-modal-button'
          onClick={() => setIsModalOpen(false)}
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
