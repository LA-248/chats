import { useContext } from 'react';
import { ChatContext } from '../contexts/ChatContext';

export default function ContactHeader() {
  const { selectedChat } = useContext(ChatContext);

  return (
    <div className="contact-header-container">
      <div className="contact-header">
        {selectedChat && (
          <div
            className="chat-pic"
            style={{ height: '35px', width: '35px' }}
          ></div>
        )}
        <div className="recipient-username">{selectedChat}</div>
      </div>
    </div>
  );
}
