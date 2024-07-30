import { useContext, useEffect, useState } from 'react';
import { MessageContext } from './MessageContext';
import { SocketContext } from '../pages/home';
import { useParams } from 'react-router-dom';
import { initializeUserId } from '../utils/FetchUserId';
import ContactHeader from './ContactHeader';
import MessageInput from './MessageInput';
import parseCustomDate from '../utils/ParseDate';

function ChatView() {
  const { messages, setMessages, setChatList } = useContext(MessageContext);
  const socket = useContext(SocketContext);
  const [userId, setUserId] = useState(null);
  // Extract room from URL
  const { room } = useParams();

  useEffect(() => {
    const handleMessage = (messageData, serverOffset) => {
      // Append message to UI only if the user is currently in the room where the message was sent
      if (room === messageData.room) {
        // Concatenate new message to existing messages
        setMessages((prevMessages) => prevMessages.concat(messageData));
        if (serverOffset) {
          socket.auth.serverOffset = serverOffset;
        }
      }

      // Update chat list state with the new last message and time
      setChatList((prevChatList) => prevChatList.map((chat) =>
          chat.room === messageData.room ? {...chat, lastMessage: messageData.message, time: messageData.eventTime} : chat
        )
      );

      // Update chat in local storage with most recent message sent and time
      const storedChats = JSON.parse(localStorage.getItem('chat-list'));
      // Find the chat in the list that corresponds to the room the message was sent from, then update the last message and event time
      for (let i = 0; i < storedChats.length; i++) {
        if (storedChats[i].room === messageData.room) {
          storedChats[i].lastMessage = messageData.lastMessage;
          storedChats[i].time = messageData.eventTime;
          storedChats[i].timeWithSeconds = messageData.eventTimeWithSeconds;
        }
      }

      const sorted = storedChats.sort((a, b) => parseCustomDate(b.timeWithSeconds) - parseCustomDate(a.timeWithSeconds));
      setChatList(sorted);
      localStorage.setItem('chat-list', JSON.stringify(sorted));
    };

    const handleInitialMessages = (initialMessages) => {
      setMessages(initialMessages);
    };

    // Join the room and request messages
    socket.emit('join-room', room);

    // Display all private chat messages on load
    socket.on('initial-messages', handleInitialMessages);

    // Listen for incoming messages from the server and update the messages list
    socket.on('chat-message', handleMessage);

    return () => {
      socket.emit('leave-room', room);
      socket.off('initial-messages', handleInitialMessages);
      socket.off('chat-message', handleMessage);
    };
  }, [setMessages, socket, room, setChatList]);

  useEffect(() => {
    initializeUserId(setUserId);
  }, []);

  return (
    <div>
      <ContactHeader />

      {/* Only render the messages if the user is a part of the private chat */}
      {room.includes(userId) && (
        <ul id="messages">
          {messages.map((messageData, index) => (
            <li className="individual-message" key={index}>
              <div className="message-info-container">
                <div className="message-from">{messageData.from}:</div>
                <div className="message-content">{messageData.message}</div>
              </div>
              <div className="message-time">{messageData.eventTime}</div>
            </li>
          ))}
        </ul>
      )}

      <div className="input-container">
        <MessageInput setMessages={setMessages} />
      </div>
    </div>
  );
}

export { ChatView };
