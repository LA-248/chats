import { io } from 'https://cdn.socket.io/4.7.5/socket.io.esm.min.js';
import { createContext, useEffect, useState, useContext } from 'react';
import { Link, Outlet } from 'react-router-dom';

import { ChatContext } from '../contexts/ChatContext.jsx';
import { UserContext } from '../contexts/UserContext.jsx';
import { getLoggedInUserData } from '../api/user-api.js';
import Sidebar from '../components/Sidebar.jsx';

export const SocketContext = createContext();

export default function Home() {
  const { chatList, setActiveChatRoom } = useContext(ChatContext);
  const {
    loggedInUserId,
    setLoggedInUserId,
    setLoggedInUsername,
    setProfilePicture,
  } = useContext(UserContext);
  const [socket, setSocket] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Retrieve data for logged in user
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
      // Connect to socket server running on the backend
      const socketInstance = io('http://localhost:8080', {
        auth: {
          serverOffset: 0,
        },
        // Need to send cookies with the request
        withCredentials: true,
      });
      setSocket(socketInstance);

      return () => socketInstance.disconnect();
    }
  }, [loggedInUserId]);

  // Join the user to all rooms in they are a part of when they connect, ensures real-time updates
  useEffect(() => {
    if (loggedInUserId && socket) {
      socket.emit('initialise-chat-rooms', chatList);
    }
  }, [loggedInUserId, socket, chatList]);

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
                width: 'fit-content',
              }}
              onClick={() => setActiveChatRoom(null)}
            >
              Chats
            </Link>
            <Sidebar />
          </div>
          <div className='chat-window-container'>
            <Outlet />
          </div>
        </div>
      </SocketContext.Provider>
    )
  );
}
