import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteGroupChat } from '../../../api/group-chat-api';
import { deletePrivateChat } from '../../../api/private-chat-api';

export function useChatDelete(
  setChatList,
  setChatSearchInputText,
  activeChatRoom,
  setActiveChatRoom,
  setErrorMessage
) {
  const navigate = useNavigate();

  // Remove a conversation from the chat list
  const handleChatDelete = useCallback(
    async (event, deletedChat) => {
      event.stopPropagation();

      try {
        if (deletedChat.chat_id.includes('p')) {
          await deletePrivateChat(deletedChat.room);
        } else {
          const groupId = deletedChat.chat_id.replace('g_', '');
          await deleteGroupChat(groupId, deletedChat.room);
        }

        // Set deleted flag as true
        setChatList((chatList) =>
          chatList.map((chat) =>
            chat.room === deletedChat.room ? { ...chat, deleted: true } : chat
          )
        );

        setChatSearchInputText('');
        if (activeChatRoom === deletedChat.room) {
          setActiveChatRoom(null);
          navigate('/');
        }
      } catch (error) {
        setErrorMessage(error.message);
      }
    },
    [
      activeChatRoom,
      navigate,
      setActiveChatRoom,
      setChatList,
      setChatSearchInputText,
      setErrorMessage,
    ]
  );

  return handleChatDelete;
}
