/* eslint-disable @typescript-eslint/no-explicit-any */
import { Socket } from 'socket.io';
import { ChatList } from '../../repositories/chat-list.repository.ts';

export async function initialiseChatRooms(socket: Socket) {
  const ChatListRepository = new ChatList();
  const joinedRooms: string[] = [];

  const userId = (socket as any).request.session?.passport?.user;
  if (!userId) {
    socket.disconnect();
    return;
  }

  const chatList = await ChatListRepository.findAllChatsByUser(userId);

  for (let i = 0; i < chatList.length; i++) {
    const room = chatList[i].room;
    if (!joinedRooms.includes(room)) {
      joinedRooms.push(room);
      socket.join(room);
    }
  }

  socket.on('disconnect', () => {
    for (let i = 0; i < joinedRooms.length; i++) {
      socket.leave(joinedRooms[i]);
    }
  });
}
