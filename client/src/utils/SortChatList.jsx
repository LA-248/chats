import parseCustomDate from './ParseDate.jsx';

export default function sortChatList(setChatList) {
  const storedChat = JSON.parse(localStorage.getItem('chat-list')) || [];
  if (storedChat.length > 0) {
    // Use the time format that includes seconds for precise sorting
    const sorted = storedChat.sort((a, b) => parseCustomDate(b.timeWithSeconds) - parseCustomDate(a.timeWithSeconds));
    setChatList(sorted);
    localStorage.setItem('chat-list', JSON.stringify(sorted));
  } 
}
