import { io } from 'https://cdn.socket.io/4.7.5/socket.io.esm.min.js';
import { ChatContext } from '../contexts/ChatContext.jsx';
import { MessageContext } from '../contexts/MessageContext.jsx';
import { createContext, useEffect, useState, useContext } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { getUserData } from '../api/user-api.jsx';
import { getChatListByUserId, updateChat } from '../api/chat-api';
import Logout from '../components/UserLogout.jsx';
import DisplayUsername from '../components/DisplayUsername.jsx';
import Sidebar from '../components/Sidebar.jsx';
import ChatWindowPlaceholder from '../components/ChatWindowPlaceholder.jsx';

export const SocketContext = createContext();

export default function Home() {
  const { setMessages } = useContext(MessageContext);
  const { setChatList } = useContext(ChatContext);
  const { room } = useParams(); // Extract room from URL
  const [socket, setSocket] = useState(null);
  const [loggedInUsername, setLoggedInUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const location = useLocation();

  useEffect(() => {
    // Retrieve the username of the logged in user
    const fetchUser = async () => {
      try {
        const userData = await getUserData();
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

    return () => socketInstance.disconnect();
  }, []);

  useEffect(() => {
    if (socket) {
      // Listen for incoming messages and update the chat list
      const handleMessage = async (messageData) => {
        // Append message to UI only if the user is currently in the room where the message was sent
        if (room === messageData.room) {
          // Concatenate new message to existing messages
          setMessages((prevMessage) => prevMessage.concat(messageData));
        }

        // Update chat in state and database with most recent message sent and time
        await updateChat(messageData.message, messageData.eventTime, messageData.eventTimeWithSeconds, messageData.room);
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
            {location.pathname === '/' ? <ChatWindowPlaceholder /> : <Outlet />}
          </div>
        </div>
      </SocketContext.Provider>
    )
  );
}
