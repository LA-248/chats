import { useContext, useEffect, useState } from 'react';
import { ChatContext } from '../contexts/ChatContext';
import { MessageContext } from '../contexts/MessageContext';
import { getBlockList, updateBlockList } from '../api/user-api';

export default function ContactHeader() {
  const { selectedChat } = useContext(ChatContext);
  const { recipientId } = useContext(MessageContext);
  const [isBlocked, setIsBlocked] = useState(null);

  useEffect(() => {
    const checkBlockedStatus = async () => {
      const blockList = await getBlockList();
      console.log(blockList);
      if (blockList.includes(recipientId)) {
        setIsBlocked(true);
      } else {
        setIsBlocked(false);
      }
    };

    checkBlockedStatus();
  }, [recipientId]);

  const handleUserBlock = async () => {
    await updateBlockList(recipientId);
    setIsBlocked(true);
  };

  return (
    <div className="contact-header-container">
      <div className="contact-header">
        <div className="picture-and-name">
          {selectedChat && (
            <div
              className="chat-pic"
              style={{ height: '35px', width: '35px' }}
            ></div>
          )}
          <div className="recipient-username">{selectedChat}</div>
        </div>
        {selectedChat ? (
          <button
            className="block-user-button"
            onClick={() => handleUserBlock()}
          >
            {isBlocked ? 'Unblock' : 'Block'}
          </button>
        ) : null}
      </div>
    </div>
  );
}
