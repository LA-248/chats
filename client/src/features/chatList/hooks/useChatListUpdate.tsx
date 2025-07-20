import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import type { Chat, ChatMetadata } from '../../../types/chat';

/* 
Update chat list with latest content and time info on incoming messages, and sort it
Also mark the chat as not deleted, which ensures the chat is added for the -
recipient if they had it marked as deleted
*/
export default function useChatListUpdate(
  socket: Socket | null,
  setChatList: React.Dispatch<React.SetStateAction<Chat[]>>,
  activeChatRoom: string | null
) {
  useEffect(() => {
    if (socket) {
      const handleChatListUpdate = (chatData: ChatMetadata): void => {
        setChatList((prevChatList) =>
          prevChatList
            .map((chat) =>
              chat.room === chatData.room
                ? {
                    ...chat,
                    last_message_content: chatData.lastMessageContent,
                    last_message_time: chatData.lastMessageTime,
                    updated_at: chatData.updatedAt,
                    deleted: false,
                    read: activeChatRoom !== chat.room ? false : true,
                  }
                : chat
            )
            .sort((a, b) => {
              const timeA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
              const timeB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
              return timeB - timeA;
            })
        );
      };

      // Update chat in chat list when the last remaining message in a chat is deleted or edited
      const handleLastMessageUpdate = (lastMessageData: ChatMetadata): void => {
        setChatList((prevChatList) =>
          prevChatList
            .map((chat) =>
              chat.room === lastMessageData.room
                ? {
                    ...chat,
                    last_message_content: lastMessageData.lastMessageContent,
                    last_message_time: lastMessageData.lastMessageTime,
                    updated_at: lastMessageData.updatedAt,
                  }
                : chat
            )
            .sort((a, b) => {
              const timeA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
              const timeB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
              return timeB - timeA;
            })
        );
      };

      socket.on('update-chat-list', handleChatListUpdate);
      socket.on('last-message-updated', handleChatListUpdate);

      return () => {
        socket.off('update-chat-list', handleChatListUpdate);
        socket.off('last-message-updated', handleLastMessageUpdate);
      };
    }
  }, [setChatList, socket, activeChatRoom]);
}
