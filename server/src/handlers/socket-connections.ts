/* eslint-disable @typescript-eslint/no-explicit-any */
import { Socket } from 'socket.io';
import { ChatList } from '../repositories/chat-list.repository.ts';

async function initialiseChatRooms(socket: Socket) {
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

// Store user-to-socket mappings in a hash map
// This allows for socket connections to be associated with the correct user
function manageSocketConnections(
  socket: Socket,
  userSockets: Map<number, string>,
) {
  const userId = (socket as any).request.session?.passport?.user;
  if (!userId) {
    socket.disconnect();
    return;
  }

  userSockets.set(userId, socket.id);

  socket.on('disconnect', () => {
    if (userSockets.get(userId) === socket.id) {
      userSockets.delete(userId);
    }
  });

  console.log(userSockets);
}

export { initialiseChatRooms, manageSocketConnections };
