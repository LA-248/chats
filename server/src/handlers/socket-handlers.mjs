import { insertNewMessage, retrieveMessages } from '../models/message-model.mjs';

// TODO: Store user-socket associations in database
// Store user-to-socket mappings
// This allows for socket connections to be associated with the correct user
const userSockets = new Map();
const manageSocketConnections = (socket) => {
  socket.on('authenticate', (userId) => {
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    socket.on('disconnect', () => {
      const userSet = userSockets.get(userId);
      if (userSet) {
        userSet.delete(socket.id);
        if (userSet.size === 0) {
          userSockets.delete(userId);
        }
      }
    });

    console.log(userSockets);
  });
}

const handleChatMessages = (socket, io) => {
  socket.on('chat-message', async (data, clientOffset, callback) => {
    const { username, message } = data;

    try {
      // Insert message into the database
      const result = await insertNewMessage(message, username, clientOffset);
      console.log(`Message received: ${message} in room: ${username}`);
      io.to(username).emit('chat-message', message, result.lastID);
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
}

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
}

export {
  manageSocketConnections,
  handleChatMessages,
  displayChatMessages,
};
