import { useContext, useState } from 'react';
import { MessageContext } from '../../contexts/MessageContext';
import { ChatContext } from '../../contexts/ChatContext';
import { UserContext } from '../../contexts/UserContext';
import AddChatInput from '../chat/AddChatInput';
import ChatList from '../chat/ChatList';
import ChatSearch from '../chat/ChatSearch';
import CreateGroupChatModal from '../chat/CreateGroupChatModal';
import UserProfile from '../user/UserProfile';

export default function Sidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const { setRecipientUsername } = useContext(MessageContext);
  const { profilePicture, loggedInUsername, loggedInUserId } =
    useContext(UserContext);
  const { chatList, setChatList, setActiveChatRoom } = useContext(ChatContext);

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
      />

      {chatList.length > 0 ? (
        chatList.some((chat) => {
          return chat.user_deleted === false;
        }) ? (
          <ChatSearch />
        ) : (
          <div className='chat-list-empty-container'>
            <div className='chat-list-empty-message'>
              You have no active chats
            </div>
            <div className='chat-list-empty-subtext'>
              To get started, enter the username of the user you would like to
              chat with above
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
            chat with above
          </div>
        </div>
      )}

      <div className='chat-list-and-profile-container'>
        <ChatList setRecipientUsername={setRecipientUsername} />
        <UserProfile
          profilePicture={profilePicture}
          loggedInUsername={loggedInUsername}
          setActiveChatRoom={setActiveChatRoom}
        />
      </div>
    </div>
  );
}
