import MessageInput from '../components/MessageInput.jsx';
import RoomInput from '../components/RoomInput.jsx';
import Logout from '../components/UserLogout.jsx';
import { io } from 'https://cdn.socket.io/4.7.5/socket.io.esm.min.js'
import { MessageList } from '../components/MessageList.jsx';
import { MessageProvider } from '../components/MessageContext.jsx';
import { createContext, useEffect, useState } from 'react';
import DisplayUsername from '../components/DisplayUsername.jsx';
import fetchUserData from '../utils/FetchUserData.jsx';

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
    }
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
    // Ensure that socket is initialised before passing it to child components
    socket && (
      <SocketContext.Provider value={socket}>
        <MessageProvider>
          <div className="main-container">
            <MessageList />
            <div className="input-container">
              <RoomInput />
              <MessageInput />
            </div>
            <Logout />
            <DisplayUsername username={username}/>
          </div>
        </MessageProvider>
      </SocketContext.Provider>
    )
  );
}
