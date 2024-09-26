import { useContext, useEffect } from 'react';
import { MessageContext } from '../contexts/MessageContext';

export default function MessageSearch({
  messages,
  setFilteredMessages,
}) {
  const { messageSearchValueText, setMessageSearchValueText } = useContext(MessageContext);

  useEffect(() => {
    if (messageSearchValueText) {
      const filtered = messages.filter((message) =>
        message.content.toLowerCase().includes(messageSearchValueText.toLowerCase())
      );
      setFilteredMessages(filtered);
    } else {
      setFilteredMessages(messages);
    }
  }, [setFilteredMessages, messageSearchValueText, messages]);

  return (
    <div className="message-search-container">
      <input
        id="message-search-input"
        type="text"
        placeholder="Search messages"
        value={messageSearchValueText}
        onChange={(event) => setMessageSearchValueText(event.target.value)}
      />
    </div>
  );
}
