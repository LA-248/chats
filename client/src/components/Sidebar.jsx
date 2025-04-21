import { useContext, useState } from 'react';
import { ChatContext } from '../contexts/ChatContext';
import { UserContext } from '../contexts/UserContext';
import AddChatInput from '../features/chatList/components/AddChatInput';
import ChatList from '../features/chatList/components/ChatList';
import ChatSearch from '../features/chatList/components/ChatSearch';
import CreateGroupChatModal from '../features/groups/components/CreateGroupChatModal';
import UserProfile from '../features/users/components/UserProfile';

export default function Sidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const { profilePicture, loggedInUsername, loggedInUserId } =
    useContext(UserContext);
  const { chatList, setChatName, setChatList, setActiveChatRoom } =
    useContext(ChatContext);

  return (
    <div className='sidebar'>
      <AddChatInput
        chatList={chatList}
        setChatList={setChatList}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />

      <div className='create-group-button-container'>
        <button
          onClick={() => setIsModalOpen(true)}
          className='create-group-button'
        >
          Create group chat
        </button>
      </div>
      <CreateGroupChatModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        loggedInUsername={loggedInUsername}
        loggedInUserId={loggedInUserId}
        setChatList={setChatList}
      />

      {chatList.length > 0 ? (
        chatList.some((chat) => {
          return chat.deleted === false;
        }) ? (
          <ChatSearch />
        ) : (
          <div className='chat-list-empty-container'>
            <div className='chat-list-empty-message'>
              You have no active chats
            </div>
            <div className='chat-list-empty-subtext'>
              To get started, enter the username of the user you would like to
              chat with above or create a group chat
            </div>
          </div>
        )
      ) : (
        <div className='chat-list-empty-container'>
          <div className='chat-list-empty-message'>
            You have no active chats
          </div>
          <div className='chat-list-empty-subtext'>
            To get started, enter the username of the user you would like to
            chat with above or create a group chat
          </div>
        </div>
      )}

      <div className='chat-list-and-profile-container'>
        <ChatList setChatName={setChatName} />
        <UserProfile
          profilePicture={profilePicture}
          loggedInUsername={loggedInUsername}
          setActiveChatRoom={setActiveChatRoom}
        />
      </div>
    </div>
  );
}
