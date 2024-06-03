import MessageInput from '../components/MessageInput.jsx';
import RoomInput from '../components/RoomInput.jsx';
import Logout from '../components/UserLogout.jsx';
import { io } from 'https://cdn.socket.io/4.7.5/socket.io.esm.min.js'
import { MessageList } from '../components/MessageList.jsx';
import { MessageProvider } from '../components/MessageContext.jsx';
import { createContext, useEffect, useState } from 'react';

export const SocketContext = createContext();

export default function Home() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socket = io('http://localhost:8080', {
      auth: {
        serverOffset: 0,
      },
    });
    setSocket(socket);

    return () => {
      socket.disconnect();
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
          </div>
        </MessageProvider>
      </SocketContext.Provider>
    )
  );
}
