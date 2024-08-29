import { io } from 'https://cdn.socket.io/4.7.5/socket.io.esm.min.js';
import { MessageProvider } from '../components/MessageContext.jsx';
import { createContext, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Logout from '../components/UserLogout.jsx';
import DisplayUsername from '../components/DisplayUsername.jsx';
import fetchUserData from '../utils/FetchUserData.jsx';
import Sidebar from '../components/Sidebar.jsx';
import ChatWindowPlaceholder from '../components/ChatWindowPlaceholder.jsx';

export const SocketContext = createContext();

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [loggedInUsername, setLoggedInUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const location = useLocation();

  useEffect(() => {
    // Retrieve the username of the logged in user
    const fetchUser = async () => {
      try {
        const userData = await fetchUserData();
        setLoggedInUsername(userData.username);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    // Create a new socket connection
    const socketInstance = io('http://localhost:8080', {
      auth: {
        serverOffset: 0,
      },
      // Need to send cookies with the request
      withCredentials: true,
    });
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    // Render child components only if the socket is initialised
    socket && (
      <SocketContext.Provider value={socket}>
        <MessageProvider>
          <div className="main-container">
            <div className="sidebar-container">
              <div className="user-controls">
                <DisplayUsername username={loggedInUsername} />
                {errorMessage ? (
                  <div className="error-message" style={{ margin: '10px' }}>
                    {errorMessage}
                  </div>
                ) : null}
                <Logout />
                <a
                  href="/"
                  style={{
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '24px',
                    textDecoration: 'none',
                  }}
                >
                  Chats
                </a>
              </div>
              <Sidebar />
            </div>
            <div className="chat-window-container">
              {location.pathname === '/' ? (
                <ChatWindowPlaceholder />
              ) : (
                <Outlet />
              )}
            </div>
          </div>
        </MessageProvider>
      </SocketContext.Provider>
    )
  );
}
