import MessageInput from '../components/MessageInput.jsx';
import RoomInput from '../components/RoomInput.jsx';
import Logout from '../components/UserLogout.jsx';
import { io } from 'https://cdn.socket.io/4.7.5/socket.io.esm.min.js';
import { MessageList } from '../components/MessageList.jsx';
import { MessageProvider } from '../components/MessageContext.jsx';
import { createContext, useEffect, useState } from 'react';
import DisplayUsername from '../components/DisplayUsername.jsx';
import fetchUserData from '../utils/FetchUserData.jsx';
import Sidebar from '../components/Sidebar.jsx';

export const SocketContext = createContext();

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Retrieve account username
    const fetchUser = async () => {
      try {
        const userData = await fetchUserData();
        setUsername(userData);
      } catch (error) {
        console.error('Failed to fetch user data:', error.message);
      }
    };
    fetchUser();

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
              <RoomInput />
              <Sidebar />
              <div className="user-controls">
                <DisplayUsername username={username} />
                <Logout />
              </div>
            </div>
            <div className="chat-window-container">
              <MessageList />
              <div className="input-container">
                <MessageInput />
              </div>
            </div>
          </div>
        </MessageProvider>
      </SocketContext.Provider>
    )
  );
}
