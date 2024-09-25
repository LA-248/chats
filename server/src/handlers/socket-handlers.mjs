import { Chat } from '../models/chat-model.mjs';
import { Message } from '../models/message-model.mjs';
import { User } from '../models/user-model.mjs';
import { retrieveCurrentTime, retrieveCurrentTimeWithSeconds } from '../utils/time-utils.mjs';
import addChatForRecipientOnMessageReceive from '../utils/handle-recipient-chat-list.mjs';
import isSenderBlocked from '../utils/check-blocked-status.mjs';

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

const formatMessage = (message) => ({
  from: message.sender_username,
  message: message.content,
  eventTime: message.event_time,
  eventTimeWithSeconds: message.event_time_seconds,
  id: message.id,
  senderId: message.sender_id,
});

const handleChatMessages = (socket, io) => {
  socket.on('chat-message', async (data, clientOffset, callback) => {
    const { username, recipientId, message } = data;
    
    // Extract the recipient's socket id from the userSockets hash map by using their user id
    // This allows us to add the recipient to the correct chat room when they receive a message
    const targetUserSocketId = userSockets.get(recipientId);

    const senderId = socket.handshake.session.passport.user;
    const senderProfilePicture = await User.getUserProfilePicture(senderId);
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

      // Check if the sender is blocked from messaging the recipient, throw an error if they are
      await isSenderBlocked(recipientId, senderId);

      const newMessage = await Message.insertNewMessage(message, username, senderId, recipientId, roomName, currentTime, currentTimeWithSeconds, clientOffset);

      // Set the chat as unread for the recipient when a new message is received
      await Chat.updateMessageReadStatus(true, roomName, recipientId);

      // Add the chat to the recipient's chat list if they don't have it
      await addChatForRecipientOnMessageReceive(recipientId, username, message, true, currentTime, currentTimeWithSeconds, senderId, senderProfilePicture, roomName);

      // Send the message to both room participants
      io.to(roomName).emit('chat-message', {
        from: username,
        message: message,
        room: roomName,
        eventTime: currentTime,
        eventTimeWithSeconds: currentTimeWithSeconds,
        id: newMessage.id,
        senderId: senderId,
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

// Load all messages of a chat when opened
const displayChatMessages = async (socket, room) => {
  if (!socket.recovered) {
    try {
      // Get messages from database for display, filtered by room
      const messages = await Message.retrieveMessages(socket.handshake.auth.serverOffset, room);
      socket.emit('initial-messages', messages.map(formatMessage));
    } catch (error) {
      console.error('Unexpected error:', error);
      socket.emit('custom-error', { error: 'Unable to retrieve chat messages' });
      return;
    }
  }
};

const updateMessageReadStatus = (socket, userId) => {
  // Update message read status in database
  socket.on('update-message-read-status', async ({ hasNewMessage, room }) => {
    try {
      await Chat.updateMessageReadStatus(hasNewMessage, room, userId);
    } catch (error) {
      console.error('Error updating read status:', error);
      socket.emit('custom-error', { error: 'Unable to update message status' });
    }
  });
}

// Listen for message delete events and emit updated message list to the room
const processDeleteMessageEvent = (socket, io) => {
  socket.on('message-delete-event', async (room) => {
    try {
      const messages = await Message.retrieveMessages(socket.handshake.auth.serverOffset, room);
      io.to(room).emit('message-delete-event', messages.map(formatMessage));
    } catch (error) {
      console.error('Unexpected error:', error.message);
      socket.emit('custom-error', { error: 'Error deleting message. Please try again.' });
      return;
    }
  });
}

export {
  manageSocketConnections,
  handleChatMessages,
  displayChatMessages,
  updateMessageReadStatus,
  processDeleteMessageEvent
};
