import { Server } from 'socket.io';
import {
  displayChatMessages,
  handleChatMessages,
  updateMostRecentMessage,
  updateMessageListEvent,
} from './message-handlers.ts';
import {
  initialiseChatRooms,
  manageSocketConnections,
} from './socket-connections.ts';

const userSockets = new Map<number, string>();

// Listen for new client connections to the server and set up client-specific socket event handlers
const socketHandlers = (io: Server) => {
  io.on('connection', (socket) => {
    console.log((socket.handshake as any).session.passport.user);

    // Check if user is authenticated
    if (
      (socket.handshake as any).session.passport.user &&
      (socket.handshake as any).session.passport.user
    ) {
      const userId = (socket.handshake as any).session.passport.user;
      console.log(`User connected`);
      console.log(`User ID: ${userId}`);
      console.log(socket.rooms);

      initialiseChatRooms(socket);
      manageSocketConnections(socket, userSockets);

      handleChatMessages(socket, io);
      updateMostRecentMessage(socket, io);
      updateMessageListEvent(socket, io);

      socket.on('open-chat', (room: string) => {
        displayChatMessages(socket, room);
      });
    } else {
      socket.disconnect();
    }
  });
};

export { socketHandlers, userSockets };
