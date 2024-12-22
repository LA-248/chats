import { PrivateChat } from '../models/private-chat-model.mjs';
import { Message } from '../models/message-model.mjs';
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
  content: message.content,
  eventTime: message.event_time,
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

    try {
      // Create a consistent room name using user IDs
      // Ensure the room is the same for both users by sorting the user IDs
      const room = [senderId, recipientId].sort().join('-');

      // Make the recipient join the private chat room
      io.in(targetUserSocketId).socketsJoin(room);

      // Make the sender join the room
      socket.join(room);

      // Check if the sender is blocked from messaging the recipient, throw an error if they are
      await isSenderBlocked(recipientId, senderId);

      const newMessage = await Message.insertNewMessage(
        message,
        senderId,
        recipientId,
        room,
        clientOffset
      );
      await PrivateChat.updateLastMessage(newMessage.id, room);

      // Add the chat to the recipient's chat list if they don't have it
      await addChatForRecipientOnMessageReceive(
        senderId,
        recipientId,
        null,
        room
      );

      // Send the message to both room participants
      io.to(room).emit('chat-message', {
        from: username,
        content: message,
        room: room,
        eventTime: newMessage.event_time,
        id: newMessage.id,
        senderId: senderId,
      });
    } catch (error) {
      // Check if the message was already inserted
      if (error.errno === 19) {
        callback('Error sending message');
        console.error(
          'Message with this client offset already exists:',
          clientOffset
        );
      } else {
        callback('Error sending message');
        console.error(`Error sending message: ${error}`);
      }
    }
  });
};

// Load all messages of a chat when opened
const displayChatMessages = async (socket, room) => {
  if (!socket.recovered) {
    try {
      // Get messages from database for display, filtered by room
      const messages = await Message.retrieveMessages(
        socket.handshake.auth.serverOffset,
        room
      );
      socket.emit('initial-messages', messages.map(formatMessage));
    } catch (error) {
      console.error('Unexpected error:', error);
      socket.emit('custom-error', {
        error: 'Unable to retrieve chat messages',
      });
      return;
    }
  }
};

// TODO: Instead of retrieving the whole message list for edits, only fetch the edited message
// Listen for message events such as deletes and edits, and emit the updated message list to the room
const processUpdateMessageEvent = (socket, io) => {
  socket.on('message-update-event', async (room, updateType) => {
    try {
      const messages = await Message.retrieveMessages(
        socket.handshake.auth.serverOffset,
        room
      );
      io.to(room).emit(
        'message-update-event',
        messages.map(formatMessage),
        updateType
      );
    } catch (error) {
      console.error('Unexpected error:', error.message);
      socket.emit('custom-error', {
        error: `Error ${updateType} message. Please try again.`,
      });
      return;
    }
  });
};

export {
  manageSocketConnections,
  handleChatMessages,
  displayChatMessages,
  processUpdateMessageEvent,
};
