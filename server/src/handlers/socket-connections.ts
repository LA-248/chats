/* eslint-disable @typescript-eslint/no-explicit-any */
import { Socket } from 'socket.io';
import { Chat } from '../models/chat-list.model.ts';
import '../types/socket.d.ts';

async function initialiseChatRooms(socket: Socket) {
  const joinedRooms: string[] = [];

  const userId = (socket.handshake as any).session.passport.user;
  const chatList = await Chat.retrieveAllChatsByUser(userId);

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
  userSockets: Map<number, string>
) {
  // Use type assertion to inform TypeScript about the session property
  const userId = (socket.handshake as any).session.passport.user;
  userSockets.set(userId, socket.id);

  socket.on('disconnect', () => {
    if (userSockets.get(userId) === socket.id) {
      userSockets.delete(userId);
    }
  });

  console.log(userSockets);
}

export { initialiseChatRooms, manageSocketConnections };
