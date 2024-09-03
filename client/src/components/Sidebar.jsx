import { useCallback, useContext, useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { MessageContext } from '../contexts/MessageContext';
import { ChatContext } from '../contexts/ChatContext';
import { addChat, getChatListByUserId } from '../api/chat-api';
import { getRecipientUserId, getUserId } from '../api/user-api';
import AddChatInput from './AddChatInput';
import ChatList from './ChatList';
import ChatSearch from './ChatSearch';
import GroupChatModal from './GroupChatModal';

export default function Sidebar() {
  const socket = useSocket();
  const [userId, setUserId] = useState(null);
  const [inputUsername, setInputUsername] = useState('');
  const [chatSearchInputText, setChatSearchInputText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const { setRecipientId } = useContext(MessageContext);
  const { setUsername, selectedChat, setSelectedChat, chatList, setChatList } = useContext(ChatContext);

  // Adds a new chat to the sidebar
  const handleAddChat = useCallback(async (event) => {
    event.preventDefault();
  
    try {
      const newChatItem = await addChat(inputUsername, chatList);
      let updatedChatList = chatList.concat(newChatItem);
      // Get the most recent and sorted version of the user's chat list - ensures the chat list is in the correct order after a chat is deleted and re-added
      updatedChatList = await getChatListByUserId();
      setChatList(updatedChatList);
      setInputUsername('');
    } catch (error) {
      setErrorMessage(error.message);
    }
  }, [chatList, setChatList, inputUsername]);

  // 
  useEffect(() => {
    getUserId(setUserId, setErrorMessage);
  }, []);

  // Needed to store user-to-socket mappings on the server
  useEffect(() => {
    if (socket && userId) {
      socket.emit('authenticate', userId);
    }
  }, [socket, userId]);

  // Retrieve the ID of the chat user selected
  // We can then get the socket ID associated with the recipient's user ID on the server
  // This is needed so private messages are sent to the correct user
  useEffect(() => {
    if (selectedChat) {
      const getRecipientId = async () => {
        try {
          const userId = await getRecipientUserId(selectedChat);
          setRecipientId(userId);
        } catch (error) {
          setErrorMessage(error.message);
        }
      };

      getRecipientId();
    }
  }, [selectedChat, userId, setRecipientId]);

  return (
    <div className="sidebar">
      <AddChatInput
        inputUsername={inputUsername}
        setInputUsername={setInputUsername}
        handleAddChat={handleAddChat}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />

      <div className="create-group-button-container">
        <button onClick={() => setIsModalOpen(true)} className="create-group-button">
          Create group chat
        </button>
      </div>
      <GroupChatModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />

      <ChatSearch
        chatSearchInputText={chatSearchInputText}
        setChatSearchInputText={setChatSearchInputText}
        chatList={chatList}
        setChatList={setChatList}
      />

      <ChatList
        userId={userId}
        setSelectedChat={setSelectedChat}
        setUsername={setUsername}
        chatSearchInputText={chatSearchInputText}
        setChatSearchInputText={setChatSearchInputText}
      />

      {/* 
      <div className="sidebar-items">
        <div className="chat-list-empty-container">
          <div className="chat-list-empty-message">
            You have no active chats
          </div>
          <div className="chat-list-empty-subtext">
            To get started, enter the username of the person you would like to
            chat with above
          </div>
        </div>
      </div>        
      */}
    </div>
  );
}
