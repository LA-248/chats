import { Message } from '../models/message-model.mjs';
import { retrieveCurrentTime, retrieveCurrentTimeWithSeconds } from '../utils/time-utils.mjs';

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
    const senderId = socket.handshake.session.passport.user;
    const currentTime = retrieveCurrentTime();
    const currentTimeWithSeconds = retrieveCurrentTimeWithSeconds();

    try {
      // Create a consistent room name using user IDs
      // Ensure the room is the same for both users by sorting the user IDs
      const roomName = [senderId, recipientId].sort().join('-');

      // Make the recipient join the private chat room
      io.in(targetUserSocketId).socketsJoin(roomName);

      // Make the sender join the room
      socket.join(roomName);

      console.log(`Message received: ${message} from ${username} in room: ${roomName}`);

      // Insert message into the database with relevant metadata
      await Message.insertNewMessage(message, username, senderId, recipientId, roomName, currentTime, currentTimeWithSeconds, clientOffset);

      // Retrieve most recent message sent in a chat room
      const lastMessage = await Message.retrieveLastMessageInfo(roomName);

      // Send the message to both room participants
      io.to(roomName).emit('chat-message', {
        from: username,
        message: message,
        room: roomName,
        lastMessage: lastMessage,
        eventTime: currentTime,
        eventTimeWithSeconds: currentTimeWithSeconds,
      });
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

const displayChatMessages = async (socket, room) => {
  if (!socket.recovered) {
    try {
      // Get messages from database for display, filtered by room
      const messages = await Message.retrieveMessages(socket.handshake.auth.serverOffset, room);
      console.log(messages);

      socket.emit('initial-messages', messages.map(msg => ({
        from: msg.sender_username,
        message: msg.content,
        eventTime: msg.event_time,
        id: msg.id,
      })));
    } catch (error) {
      console.error('Unexpected error:', error.message);
      return;
    }
  }
};

export { manageSocketConnections, handleChatMessages, displayChatMessages };
