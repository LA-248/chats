import {
  displayChatMessages,
  handleChatMessages,
  processUpdateMessageEvent,
} from './message-handlers.mjs';
import manageSocketConnections from './socket-connections.mjs';

const userSockets = new Map();

// Listen for new client connections to the server and set up client-specific socket event handlers
const socketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(socket.handshake.session);

    // Check if user is authenticated
    if (
      socket.handshake.session.passport &&
      socket.handshake.session.passport.user
    ) {
      const userId = socket.handshake.session.passport.user;
      console.log(`User connected`);
      console.log(`User ID: ${userId}`);
      console.log(socket.rooms);

      manageSocketConnections(socket, userSockets);
      handleChatMessages(socket, io, userSockets);

      socket.on('join-room', (room) => {
        socket.join(room);
        displayChatMessages(socket, room);
      });

      socket.on('leave-room', (room) => {
        socket.leave(room);
      });

      processUpdateMessageEvent(socket, io);
    } else {
      socket.disconnect();
    }
  });
};

export { socketHandlers };
