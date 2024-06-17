import { useContext } from 'react';
import { MessageContext } from './MessageContext';

export default function ContactHeader() {
  const { selectedChat } = useContext(MessageContext);

  return (
    <div className="contact-header-container">
      <div className="recipient-username">{selectedChat}</div>
    </div>
  );
}
