import {
  insertNewMessage,
  retrieveMessages,
} from '../models/message-model.mjs';

// TODO: Store user-socket associations in database
// Store user-to-socket mappings
// This allows for socket connections to be associated with the correct user
const userSockets = new Map();
const manageSocketConnections = (socket) => {
  socket.on('authenticate', (userId) => {
    userSockets.set(userId, socket.id);

    socket.on('disconnect', () => {
      if (userSockets.get(userId) === socket.id) {
        userSockets.delete(userId);
      }
    });

    console.log(userSockets);
  });
};

const handleChatMessages = (socket, io) => {
  socket.on('chat-message', async (data, clientOffset, callback) => {
    const { username, recipientId, message } = data;
    const targetUserSocketId = userSockets.get(recipientId);
    const userId = socket.handshake.session.passport.user;

    try {
      // Create a consistent room name using user IDs
      // Ensure the room is the same for both users by sorting the user IDs
      const roomName = [userId, recipientId].sort().join('-');

      // Make the recipient join the private chat room
      io.in(targetUserSocketId).socketsJoin(roomName);

      // Make the sender join the room
      socket.join(roomName);

      // Send the message to both room participants
      io.to(roomName).emit('chat-message', {
        from: username,
        message: message,
      });

      console.log(`Message received: ${message} from ${username} in room: ${roomName}`);

      // Insert message into the database
      const result = await insertNewMessage(message, roomName, clientOffset);
    } catch (error) {
      // Check if the message was already inserted
      if (error.errno === 19) {
        // If it was, notify the client
        callback('Message already inserted');
      } else {
        console.error(`Error inserting message: ${error.message}`);
      }
    }
  });
};

const displayChatMessages = async (socket) => {
  if (!socket.recovered) {
    try {
      // Get messages from database for display
      const messages = await retrieveMessages(socket.handshake.auth.serverOffset);
      for (let i = 0; i < messages.length; i++) {
        socket.emit('chat-message', messages[i].content, messages[i].id);
      }
    } catch (error) {
      console.error('Unexpected error:', error.message);
      return;
    }
  }
};

export { manageSocketConnections, handleChatMessages, displayChatMessages };
