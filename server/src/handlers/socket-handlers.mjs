import { insertNewMessage, retrieveMessages } from '../models/message-model.mjs';

const handleChatList = (socket) => {
  socket.on('chat-list', (username) => {
    console.log(`Added ${username} to chat list`);
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
  handleChatList,
  handleChatMessages,
  displayChatMessages,
};
