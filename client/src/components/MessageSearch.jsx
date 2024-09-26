import { useEffect } from 'react';

export default function MessageSearch({
  messageSearchInput,
  setMessageSearchInput,
  messages,
  setFilteredMessages,
}) {
  useEffect(() => {
    if (messageSearchInput) {
      const filtered = messages.filter((message) =>
        message.message.toLowerCase().includes(messageSearchInput.toLowerCase())
      );
      setFilteredMessages(filtered);
    } else {
      setFilteredMessages(messages);
    }
  }, [setFilteredMessages, messageSearchInput, messages]);

  return (
    <div className="message-search-container">
      <input
        id="message-search-input"
        type="text"
        placeholder="Search messages"
        value={messageSearchInput}
        onChange={(event) => setMessageSearchInput(event.target.value)}
      />
    </div>
  );
}
