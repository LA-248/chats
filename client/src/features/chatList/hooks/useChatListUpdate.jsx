import { useEffect } from 'react';

/* 
  Update chat list with latest content and time info on incoming messages, and sort it
  Also mark the chat as not deleted, which ensures the chat is added for the -
  recipient if they had it marked as deleted
  */
export default function useChatListUpdate(socket, setChatList, activeChatRoom) {
  useEffect(() => {
    if (socket) {
      const handleChatListUpdate = (chatListData, eventType) => {
        setChatList((prevChatList) =>
          prevChatList
            .map((chat) =>
              chat.room === chatListData.room
                ? {
                    ...chat,
                    last_message_content: chatListData.lastMessageContent,
                    last_message_time: chatListData.lastMessageTime,
                    updated_at: chatListData.updatedAt,
                    // Only add deleted if the eventType is update-chat-list
                    ...(eventType === 'update-chat-list' && {
                      deleted: chatListData.deleted,
                      read: activeChatRoom !== chat.room ? false : true,
                    }),
                  }
                : chat
            )
            .sort((a, b) => {
              const timeA = a.updated_at ? new Date(a.updated_at) : null;
              const timeB = b.updated_at ? new Date(b.updated_at) : null;
              return timeB - timeA;
            })
        );
      };

      socket.on('update-chat-list', (data) =>
        handleChatListUpdate(data, 'update-chat-list')
      );
      socket.on('last-message-updated', (data) =>
        handleChatListUpdate(data, 'last-message-updated')
      );

      return () => {
        socket.off('update-chat-list');
        socket.off('last-message-updated');
      };
    }
  }, [setChatList, socket, activeChatRoom]);
}
