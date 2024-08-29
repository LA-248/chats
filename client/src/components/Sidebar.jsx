import { useCallback, useContext, useEffect, useState } from 'react';
import { MessageContext } from './MessageContext';
import { retrieveUserId } from '../utils/FetchUserId';
import { SocketContext } from '../pages/home';
import { fetchRecipientUserId } from '../utils/FetchRecipientUserId';
import { addChat } from '../utils/AddToChatList';
import AddChatInput from './AddChatInput';
import ChatList from './ChatList';
import ChatSearch from './ChatSearch';
import fetchChatList from '../utils/FetchChatList';

export default function Sidebar() {
  const [userId, setUserId] = useState(null);
  const [inputUsername, setInputUsername] = useState('');
  const [chatSearchInputText, setChatSearchInputText] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const { setUsername, selectedChat, setSelectedChat, setRecipientId, chatList, setChatList } = useContext(MessageContext);
  const socket = useContext(SocketContext);

  useEffect(() => {
    retrieveUserId(setUserId, setErrorMessage);
  }, []);

  // Needed to store user-to-socket mappings on the server
  useEffect(() => {
    if (socket && userId) {
      socket.emit('authenticate', userId);
    }
  }, [socket, userId]);

  const handleAddChat = useCallback(async (event) => {
    event.preventDefault();
  
    try {
      const newChatItem = await addChat(inputUsername, chatList);
      let updatedChatList = chatList.concat(newChatItem);
      // Get the most recent and sorted version of the user's chat list - ensures the chat list is in the correct order after a chat is deleted and re-added
      updatedChatList = await fetchChatList();
      setChatList(updatedChatList);
      setInputUsername('');
    } catch (error) {
      setErrorMessage(error.message);
    }
  }, [chatList, setChatList, inputUsername]);

  // Retrieve the ID of the chat user selected
  // We can then get the socket ID associated with the recipient's user ID on the server
  // This is needed so private messages are sent to the correct user
  useEffect(() => {
    if (selectedChat) {
      const getRecipientId = async () => {
        try {
          const userId = await fetchRecipientUserId(selectedChat);
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
