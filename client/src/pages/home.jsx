import { io } from 'https://cdn.socket.io/4.7.5/socket.io.esm.min.js';
import { ChatContext } from '../contexts/ChatContext.jsx';
import { MessageContext } from '../contexts/MessageContext.jsx';
import { UserContext } from '../contexts/UserContext.jsx';
import { createContext, useEffect, useState, useContext } from 'react';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import { getLoggedInUserData } from '../api/user-api.jsx';
import { getChatListByUserId } from '../api/chat-api';
import Sidebar from '../components/common/Sidebar.jsx';
import ChatWindowPlaceholder from '../components/chat/ChatWindowPlaceholder.jsx';

export const SocketContext = createContext();

export default function Home() {
  const { setMessages } = useContext(MessageContext);
  const { setChatList, setActiveChatRoom } = useContext(ChatContext);
  const {
    loggedInUserId,
    setLoggedInUserId,
    setLoggedInUsername,
    setProfilePicture,
  } = useContext(UserContext);
  const { room } = useParams(); // Extract room from URL
  const [socket, setSocket] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const location = useLocation();

  useEffect(() => {
    // Retrieve user data
    const fetchUserData = async () => {
      try {
        const userData = await getLoggedInUserData();
        setLoggedInUserId(userData.userId);
        setLoggedInUsername(userData.username);

        setProfilePicture(
          userData.profilePicture || '/images/default-avatar.jpg'
        );
      } catch (error) {
        setErrorMessage(error.message);
      }
    };
    fetchUserData();
  }, [setLoggedInUserId, setLoggedInUsername, setProfilePicture]);

  useEffect(() => {
    if (loggedInUserId) {
      // Create a new socket connection
      const socketInstance = io('http://localhost:8080', {
        auth: {
          serverOffset: 0,
        },
        // Need to send cookies with the request
        withCredentials: true,
      });
      socketInstance.emit('authenticate', loggedInUserId);
      setSocket(socketInstance);

      return () => socketInstance.disconnect();
    }
  }, [loggedInUserId]);

  useEffect(() => {
    if (socket) {
      // Listen for incoming messages and update the chat list
      const handleMessage = async (messageData) => {
        // Append message to UI only if the user is currently in the room where the message was sent
        if (room === messageData.room) {
          setMessages((prevMessages) => prevMessages.concat(messageData));
        }

        // Update chat in state and database with the most recent message sent
        // await updateChatList(messageData.content, messageData.room);
        const storedChats = await getChatListByUserId();
        setChatList(storedChats);
      };

      socket.on('chat-message', handleMessage);

      return () => socket.off('chat-message', handleMessage);
    }
  }, [setChatList, setMessages, room, socket]);

  return (
    // Render child components only if the socket is initialised
    socket && (
      <SocketContext.Provider value={socket}>
        <div className='main-container'>
          <div className='sidebar-container'>
            {errorMessage ? (
              <div className='error-message'>{errorMessage}</div>
            ) : null}
            <Link
              to='/'
              style={{
                color: '#1db954',
                fontWeight: '600',
                fontSize: '28px',
                textDecoration: 'none',
                padding: '10px 10px 0px 10px',
              }}
              onClick={() => setActiveChatRoom(null)}
            >
              Chats
            </Link>
            <Sidebar />
          </div>
          <div className='chat-window-container'>
            {location.pathname === '/' ? <ChatWindowPlaceholder /> : <Outlet />}
          </div>
        </div>
      </SocketContext.Provider>
    )
  );
}
