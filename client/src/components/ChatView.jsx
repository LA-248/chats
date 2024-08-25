import { useContext, useEffect, useState } from 'react';
import { MessageContext } from './MessageContext';
import { SocketContext } from '../pages/home';
import { useParams } from 'react-router-dom';
import { retrieveUserId } from '../utils/FetchUserId';
import ContactHeader from './ContactHeader';
import MessageInput from './MessageInput';
import fetchChatList from '../utils/FetchChatList';
import updateChat from '../utils/UpdateChat';

function ChatView() {
  const { messages, setMessages, setChatList } = useContext(MessageContext);
  const socket = useContext(SocketContext);
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

      // Update chat list state with the new last message and time
      setChatList((prevChatList) => prevChatList.map((chat) =>
          chat.room === messageData.room ? {...chat, lastMessage: messageData.message, time: messageData.eventTime} : chat
        )
      );

      // Update chat in database with most recent message sent and time
      await updateChat(messageData.message, messageData.eventTime, messageData.eventTimeWithSeconds, messageData.room);
      const storedChats = await fetchChatList();
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
    retrieveUserId(setUserId, setErrorMessage);
  }, []);

  return (
    <div>
      <ContactHeader />
      
      {/* Only render the messages if the user is a part of the private chat */}
      {room.includes(userId) && (
        <>
          <div className="messages-and-input-container">
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
                      <div className="message-content">
                        {messageData.message}
                      </div>
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
        </>
      )}
    </div>
  );
}

export { ChatView };
