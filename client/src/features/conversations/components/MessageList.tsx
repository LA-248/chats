import { useContext, useEffect, useState } from 'react';
import { useSocket } from '../../../hooks/useSocket';
import { UserContext } from '../../../contexts/UserContext';
import { MessageContext } from '../../../contexts/MessageContext';
import { ChatContext } from '../../../contexts/ChatContext';
import { updateBlockList } from '../../../api/user-api';
import { updateReadStatus } from '../../../api/private-chat-api';
import { markUserAsRead } from '../../../api/group-chat-api';
import ContactInfoModal from './ContactInfoModal';
import formatDate from '../../../utils/DateTimeFormat';
import type { GroupInfoWithMembers } from '../../../types/group';
import type { Message } from '../../../types/message';
import { ChatType } from '../../../types/chat';

interface MessageListProps {
  room: string;
  chatType: string;
  groupChatInfo: GroupInfoWithMembers;
  recipientUserId: number;
  hoveredIndex: number | null;
  setHoveredIndex: React.Dispatch<React.SetStateAction<number | null>>;
  setIsEditModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setMessageId: React.Dispatch<React.SetStateAction<number | null>>;
  setMessageIndex: React.Dispatch<React.SetStateAction<number | null>>;
}

export default function MessageList({
  room,
  chatType,
  groupChatInfo,
  recipientUserId,
  hoveredIndex,
  setHoveredIndex,
  setIsEditModalOpen,
  setIsDeleteModalOpen,
  setMessageId,
  setMessageIndex,
}: MessageListProps) {
  const isPrivateChat = chatType === ChatType.PRIVATE;
  const isGroupChat = chatType === ChatType.GROUP;
  const socket = useSocket();

  const { recipientProfilePicture, chatName } = useContext(ChatContext);
  const { loggedInUsername, loggedInUserId, profilePicture } =
    useContext(UserContext);
  const {
    setMessages,
    setCurrentMessage,
    messageSearchValueText,
    filteredMessages,
  } = useContext(MessageContext);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const groupMembersInfo = groupChatInfo.members;

  useEffect(() => {
    if (socket) {
      const handleMessage = async (messageData: Message): Promise<void> => {
        try {
          // Append message to UI only if the user is currently in the room where the message was sent
          if (room === messageData.room) {
            setMessages((prevMessages: Message[]) =>
              prevMessages.concat(messageData)
            );
            // If a message is received while the user has the chat open, automatically mark the chat as read
            if (messageData.chatType === ChatType.PRIVATE) {
              await updateReadStatus(true, room);
            } else if (messageData.chatType === ChatType.GROUP) {
              await markUserAsRead(room);
            }
          }
        } catch (error) {
          if (error instanceof Error) {
            setErrorMessage(error.message);
          }
        }
      };
      socket.on('chat-message', handleMessage);

      return () => {
        socket.off('chat-message', handleMessage);
      };
    }
  }, [room, socket, setMessages]);

  const getChatMemberProfilePicture = (messageData: Message): string => {
    if (isGroupChat) {
      const groupMember = groupMembersInfo.find(
        (member) => messageData.senderId === member.user_id
      );
      return groupMember?.profile_picture || '/images/default-avatar.jpg';
    }

    if (isPrivateChat) {
      if (loggedInUserId === messageData.senderId) {
        return profilePicture || '/images/default-avatar.jpg';
      } else {
        return recipientProfilePicture || '/images/default-avatar.jpg';
      }
    }

    return '/images/default-avatar.jpg';
  };

  return (
    <>
      {isModalOpen && (
        <ContactInfoModal
          recipientUserId={recipientUserId}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          updateBlockList={updateBlockList}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
        />
      )}

      {/* Only render the messages if the user is a part of the private chat */}
      <div className='chat-content-container'>
        <div className='messages-container'>
          <ul id='messages'>
            {messageSearchValueText && filteredMessages.length === 0 ? (
              <div id='no-messages-state'>No messages found</div>
            ) : (
              filteredMessages.map((messageData, index) => (
                <li
                  className='individual-message'
                  key={index}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className='message-container'>
                    {
                      <img
                        className='message-profile-picture'
                        src={getChatMemberProfilePicture(messageData)}
                        alt='Profile avatar'
                      />
                    }
                    <div className='message-metadata'>
                      <div className='message-details'>
                        <div
                          className={`message-from ${
                            loggedInUserId !== messageData.senderId &&
                            isPrivateChat
                              ? 'clickable'
                              : ''
                          }`}
                          onClick={() =>
                            loggedInUserId !== messageData.senderId &&
                            isPrivateChat
                              ? setIsModalOpen(true)
                              : null
                          }
                        >
                          {isPrivateChat
                            ? loggedInUserId !== messageData.senderId
                              ? chatName
                              : loggedInUsername
                            : messageData.from}
                        </div>
                        <div className='message-time'>
                          {formatDate(messageData.eventTime)}
                        </div>
                        {hoveredIndex === index &&
                        loggedInUserId === messageData.senderId ? (
                          <div className='message-actions-button'>
                            <div
                              className='message-edit-button'
                              onClick={() => {
                                setIsEditModalOpen(true);
                                setMessageId(messageData.id);
                                setMessageIndex(index);
                                setCurrentMessage(messageData.content);
                              }}
                            >
                              Edit
                            </div>
                            <div
                              className='message-delete-button'
                              onClick={() => {
                                setIsDeleteModalOpen(true);
                                setMessageId(messageData.id);
                                setMessageIndex(index);
                              }}
                            >
                              Delete
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <div className='message-content-container'>
                        <div className='message-content'>
                          {messageData.content}
                        </div>
                        {messageData.isEdited ? (
                          <div className='message-edited-tag'>(edited)</div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
        {errorMessage ? (
          <div
            className='error-message'
            style={{ margin: '20px', textAlign: 'left' }}
          >
            {errorMessage}
          </div>
        ) : null}
      </div>
    </>
  );
}
