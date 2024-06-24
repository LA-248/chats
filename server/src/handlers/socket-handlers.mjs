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

    try {
      // Send to the target user
      socket.to(targetUserSocketId).emit('chat-message', {
        from: username,
        message: message,
      });

      // Send to yourself
      socket.emit('chat-message', {
        from: 'You',
        message: message,
      });

      // Insert message into the database
      // const result = await insertNewMessage(message, recipientId, clientOffset);
      console.log(`Message received: ${message} in room: ${targetUserSocketId}`);
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
