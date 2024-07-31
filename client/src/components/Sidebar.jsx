import { useContext, useEffect, useState } from 'react';
import { MessageContext } from './MessageContext';
import { initializeUserId } from '../utils/FetchUserId';
import { SocketContext } from '../pages/home';
import { fetchRecipientUserId } from '../utils/FetchRecipientUserId';
import { addChat } from '../utils/AddToChatList';
import AddChatInput from './AddChatInput';
import ChatList from './ChatList';
import ChatSearch from './ChatSearch';

export default function Sidebar() {
  const [userId, setUserId] = useState(null);
  const [inputUsername, setInputUsername] = useState('');
  const [chatSearchInputText, setChatSearchInputText] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const { setUsername, selectedChat, setSelectedChat, setRecipientId, chatList, setChatList } = useContext(MessageContext);
  const socket = useContext(SocketContext); 

  useEffect(() => {
    // Retrieve chat list from local storage
    const storedChatList = localStorage.getItem('chat-list');
    if (storedChatList) {
      // Need to parse JSON back to JavaScript object so it can be mapped through
      setChatList(JSON.parse(storedChatList));
    }

    initializeUserId(setUserId);
  }, [setChatList]);

  // Needed to store user-to-socket mappings on the server
  useEffect(() => {
    if (socket && userId) {
      socket.emit('authenticate', userId);
    }
  }, [socket, userId]);

  const handleAddChat = async (event) => {
    event.preventDefault();

    try {
      const newChatItem = await addChat(inputUsername, chatList, userId);
      const updatedChatList = chatList.concat(newChatItem);
      setChatList(updatedChatList);

      // Update the chat list in localStorage with the new chat item
      const existingChatList = JSON.parse(localStorage.getItem('chat-list')) || [];
      const newChatList = existingChatList.concat(newChatItem);
      localStorage.setItem('chat-list', JSON.stringify(newChatList));

      setInputUsername('');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

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
      <ChatSearch
        chatSearchInputText={chatSearchInputText}
        setChatSearchInputText={setChatSearchInputText}
        chatList={chatList}
        setChatList={setChatList}
      />

      <div className="sidebar-items">
        <ChatList
          userId={userId}
          setSelectedChat={setSelectedChat}
          setUsername={setUsername}
          chatSearchInputText={chatSearchInputText}
        />
        <AddChatInput
          inputUsername={inputUsername}
          setInputUsername={setInputUsername}
          handleAddChat={handleAddChat}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
        />
      </div>
    </div>
  );
}
