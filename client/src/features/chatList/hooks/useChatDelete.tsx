import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteGroupChat } from '../../../api/group-chat-api';
import { deletePrivateChat } from '../../../api/private-chat-api';
import { Chat } from '../../../types/chat';

export function useChatDelete(
  setChatList: React.Dispatch<React.SetStateAction<Chat[]>>,
  setChatSearchInputText: React.Dispatch<React.SetStateAction<string>>,
  activeChatRoom: string | null,
  setActiveChatRoom: React.Dispatch<React.SetStateAction<string | null>>,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>
) {
  const navigate = useNavigate();

  // Remove a conversation from the chat list
  const handleChatDelete = useCallback(
    async (
      event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
      deletedChat: Chat
    ): Promise<void> => {
      event.stopPropagation();

      try {
        if (deletedChat.chat_id.includes('p')) {
          await deletePrivateChat(deletedChat.room);
        } else {
          const groupId = Number(deletedChat.chat_id.replace('g_', ''));
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
        if (error instanceof Error) {
          setErrorMessage(error.message);
        }
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
