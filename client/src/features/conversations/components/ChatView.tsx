import { useContext, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useSocket } from '../../../hooks/useSocket';
import { MessageContext } from '../../../contexts/MessageContext';
import type { Message } from '../../../types/message';
import { useSocketErrorHandling } from '../../../hooks/useSocketErrorHandling';
import ContactHeader from './ContactHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import DeleteMessageModal from './DeleteMessageModal';
import EditMessageModal from './EditMessageModal';
import usePrivateChatInfo from '../hooks/usePrivateChatInfo';
import useGroupChatInfo from '../../groups/hooks/useGroupChatInfo';

function ChatView() {
  const location = useLocation();
  // Extract chat type from URL path
  const pathSegments = location.pathname.split('/');
  const chatType = pathSegments[1];

  const { setMessages } = useContext(MessageContext);

  const { room } = useParams();
  const socket = useSocket();
  const [messageId, setMessageId] = useState<number | null>(null);
  const [messageIndex, setMessageIndex] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const privateChatInfo = usePrivateChatInfo(room!, chatType, setErrorMessage);
  const groupChatInfo = useGroupChatInfo(room!, chatType, setErrorMessage);

  useSocketErrorHandling(socket, setErrorMessage);

  useEffect(() => {
    if (!socket) return;

    const displayInitialMessages = (initialMessages: Message[]): void => {
      setMessages(initialMessages);
    };
    const handleMessageListUpdate = (messageListData: {
      room: string;
      updatedMessageList: Message[];
    }): void => {
      if (messageListData.room === room) {
        setMessages(messageListData.updatedMessageList);
      }
    };

    socket.emit('open-chat', room);

    // Display all messages on load when opening a chat
    socket.on('initial-messages', displayInitialMessages);

    // Update chat message list for everyone in a room after a message is deleted or edited
    socket.on('message-list-update-event', handleMessageListUpdate);

    return () => {
      socket.off('initial-messages', displayInitialMessages);
      socket.off('message-list-update-event', handleMessageListUpdate);
    };
  }, [socket, room, setMessages, setErrorMessage]);

  return (
    <div className='chat-view-container'>
      <ContactHeader
        room={room!}
        chatType={chatType}
        privateChatInfo={privateChatInfo}
        groupChatInfo={groupChatInfo}
      />

      <MessageList
        room={room!}
        chatType={chatType}
        groupChatInfo={groupChatInfo}
        recipientUserId={Number(privateChatInfo.userId)}
        hoveredIndex={hoveredIndex}
        setHoveredIndex={setHoveredIndex}
        setIsEditModalOpen={setIsEditModalOpen}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        setMessageId={setMessageId}
        setMessageIndex={setMessageIndex}
      />

      <div className='message-form-container'>
        <MessageInput key={room} />
      </div>

      <DeleteMessageModal
        chatType={chatType}
        messageId={messageId}
        messageIndex={messageIndex}
        isModalOpen={isDeleteModalOpen}
        setIsModalOpen={setIsDeleteModalOpen}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />

      <EditMessageModal
        chatType={chatType}
        messageId={messageId}
        messageIndex={messageIndex}
        isModalOpen={isEditModalOpen}
        setIsModalOpen={setIsEditModalOpen}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </div>
  );
}

export { ChatView };
