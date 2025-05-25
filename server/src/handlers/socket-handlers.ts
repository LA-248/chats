import { Server } from 'socket.io';
import {
  displayChatMessages,
  handleChatMessages,
  updateMostRecentMessage,
  updateMessageList,
} from './message-handlers.ts';
import {
  initialiseChatRooms,
  manageSocketConnections,
} from './socket-connections.ts';

const userSockets = new Map<number, string>();

// Listen for new client connections to the server and set up client-specific socket event handlers
const socketHandlers = (io: Server) => {
  io.on('connection', (socket) => {
    // Check if user is authenticated
    if (
      (socket.handshake as any).session.passport.user &&
      (socket.handshake as any).session.passport.user
    ) {
      const userId = (socket.handshake as any).session.passport.user;
      console.log(`User connected`);
      console.log(`User ID: ${userId}`);

      initialiseChatRooms(socket);
      manageSocketConnections(socket, userSockets);

      handleChatMessages(socket, io);
      updateMostRecentMessage(socket, io);
      updateMessageList(socket, io);

      // Recipient data could also potentially be fetched here instead of doing it in a separate HTTP request
      socket.on('open-chat', (room: string) => {
        displayChatMessages(socket, room);
      });
    } else {
      socket.disconnect();
    }
  });
};

export { socketHandlers, userSockets };
