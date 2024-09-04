import { Chat } from '../models/chat-model.mjs';
import { Message } from '../models/message-model.mjs';
import { retrieveCurrentTime, retrieveCurrentTimeWithSeconds } from '../utils/time-utils.mjs';
import addChatForRecipientOnMessageReceive from '../utils/handle-recipient-chat-list.mjs';
import isSenderBlocked from '../utils/check-sender-blocked.mjs';

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
    
    // Extract the recipient's socket id from the hash map by using their user id associated with it
    // This allows us to add the recipient to the correct chat room when they receive a message
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

      // Check if the sender is blocked from messaging the recipient, throw an error if they are
      await isSenderBlocked(recipientId, senderId);

      // Insert message into the database with relevant metadata
      await Message.insertNewMessage(message, username, senderId, recipientId, roomName, currentTime, currentTimeWithSeconds, clientOffset);

      // Set the chat as unread for the recipient when a new message is received
      await Chat.updateMessageReadStatus(true, roomName, recipientId);

      // Add the chat to the recipient's chat list if they don't have it
      await addChatForRecipientOnMessageReceive(recipientId, username, message, true, currentTime, currentTimeWithSeconds, senderId, roomName);

      // Send the message to both room participants
      io.to(roomName).emit('chat-message', {
        from: username,
        message: message,
        room: roomName,
        eventTime: currentTime,
        eventTimeWithSeconds: currentTimeWithSeconds,
      });
    } catch (error) {
      // Check if the message was already inserted
      if (error.errno === 19) {
        callback('Error sending message');
        console.error('Message with this client offset already exists:', clientOffset);
      } else {
        callback('Error sending message');
        console.error(`Error inserting message: ${error}`);
      }
    }
  });
};

const displayChatMessages = async (socket, room) => {
  if (!socket.recovered) {
    try {
      // Get messages from database for display, filtered by room
      const messages = await Message.retrieveMessages(socket.handshake.auth.serverOffset, room);

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
