import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { MessageContext } from '../contexts/MessageContext';
import { ChatContext } from '../contexts/ChatContext';
import { getUserId } from '../api/user-api';
import { getChatListByUserId, updateChat } from '../api/chat-api';
import ContactHeader from './ContactHeader';
import MessageInput from './MessageInput';

function ChatView() {
  const { messages, setMessages } = useContext(MessageContext);
  const { setChatList } = useContext(ChatContext);
  const socket = useSocket();
  const [userId, setUserId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  // Extract room from URL
  const { room } = useParams();

  useEffect(() => {
    const handleMessage = async (messageData, serverOffset) => {
      // Append message to UI only if the user is currently in the room where the message was sent
      if (room === messageData.room) {
        // Concatenate new message to existing messages
        setMessages((prevMessages) => prevMessages.concat(messageData));
        if (serverOffset) {
          socket.auth.serverOffset = serverOffset;
        }
      }

      // Update chat in state and database with most recent message sent and time
      // Use the room to determine which chat in the list to update
      await updateChat(messageData.message, messageData.eventTime, messageData.eventTimeWithSeconds, messageData.room);
      const storedChats = await getChatListByUserId();
      setChatList(storedChats);
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
    getUserId(setUserId, setErrorMessage);
  }, []);

  return (
    <div className="chat-view-container">
      <ContactHeader />

      {/* Only render the messages if the user is a part of the private chat */}
      {room.includes(userId) && (
        <div className="chat-content-container">
          <div className="messages-container">
            <ul id="messages">
              {messages.map((messageData, index) => (
                <li className="individual-message" key={index}>
                  <div className="message-container">
                    <div className="message-metadata">
                      <div className="message-from">{messageData.from}</div>
                      <div className="message-time">
                        {messageData.eventTime}
                      </div>
                    </div>
                    <div className="message-content">{messageData.message}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {errorMessage ? (
            <div className="error-message" style={{ margin: '10px' }}>
              {errorMessage}
            </div>
          ) : null}
          <div className="message-form-container">
            <MessageInput setMessages={setMessages} />
          </div>
        </div>
      )}
    </div>
  );
}

export { ChatView };
