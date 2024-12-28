import { PrivateChat } from '../models/private-chat-model.mjs';
import { Message } from '../models/message-model.mjs';
import addChatForRecipientOnMessageReceive from '../utils/handle-recipient-chat-list.mjs';
import isSenderBlocked from '../utils/check-blocked-status.mjs';

const handleChatMessages = (socket, io, userSockets) => {
  socket.on('chat-message', async (data, clientOffset, callback) => {
    const { username, recipientId, message } = data;
    const senderId = socket.handshake.session.passport.user;

    try {
      // Join private room
      const room = joinPrivateRoom(
        io,
        socket,
        senderId,
        recipientId,
        userSockets
      );

      // Check if sender is blocked
      await checkIfBlocked(recipientId, senderId);

      // Save message
      const newMessage = await saveMessage(
        message,
        senderId,
        recipientId,
        room,
        clientOffset
      );

      // Add the chat to the recipient's chat list if they don't have it
      await addChatForRecipientOnMessageReceive(
        senderId,
        recipientId,
        null,
        room
      );

      broadcastMessage(io, room, username, message, senderId, newMessage);
    } catch (error) {
      if (
        error.message ===
        'You cannot send messages to this user as they have you blocked'
      ) {
        callback(error.message);
      }
      console.error(`Error sending message: ${error.message}`);
      callback('Error sending message');
    }
  });
};

// Load all messages of a chat when opened
const displayChatMessages = async (socket, room) => {
  if (!socket.recovered) {
    try {
      // Get messages from database for display, filtered by room
      const messages = await Message.retrieveMessageList(
        socket.handshake.auth.serverOffset,
        room
      );
      socket.emit('initial-messages', messages.map(formatMessage));
    } catch (error) {
      console.error('Unable to retrieve chat messages:', error.message);
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
      const messages = await Message.retrieveMessageList(
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

const formatMessage = (message) => ({
  from: message.sender_username,
  content: message.content,
  eventTime: message.event_time,
  id: message.message_id,
  senderId: message.sender_id,
});

const joinPrivateRoom = (io, socket, senderId, recipientId, userSockets) => {
  try {
    // Create a consistent room name using user IDs
    // Ensure the room is the same for both users by sorting the user IDs
    const room = [senderId, recipientId].sort().join('-');

    // Extract the recipient's socket id from the userSockets hash map by using their user id
    // This allows us to add the recipient to the correct chat room when they receive a message
    const recipientUserSocketId = userSockets.get(recipientId);

    if (recipientUserSocketId) {
      io.in(recipientUserSocketId).socketsJoin(room);
    }
    socket.join(room);

    return room;
  } catch (error) {
    console.error('Error joining room:', error.message);
    socket.emit('custom-error', {
      error: 'An unexpected error occurred',
    });
    return;
  }
};

const checkIfBlocked = async (recipientId, senderId) => {
  try {
    await isSenderBlocked(recipientId, senderId);
  } catch (error) {
    throw new Error(
      'You cannot send messages to this user as they have you blocked'
    );
  }
};

const saveMessage = async (
  message,
  senderId,
  recipientId,
  room,
  clientOffset
) => {
  try {
    const newMessage = await Message.insertNewMessage(
      message,
      senderId,
      recipientId,
      room,
      clientOffset
    );
    await PrivateChat.updateLastMessage(newMessage.id, room);
    return newMessage;
  } catch (error) {
    if (error.errno === 19) {
      console.error(
        'Message with this client offset already exists:',
        clientOffset
      );
    }
    throw new Error('Error saving message:', error.message);
  }
};

const broadcastMessage = (
  io,
  room,
  username,
  message,
  senderId,
  newMessage
) => {
  io.to(room).emit('chat-message', {
    from: username,
    content: message,
    room: room,
    eventTime: newMessage.event_time,
    id: newMessage.id,
    senderId: senderId,
  });

  io.to(room).emit('update-chat-list', {
    room: room,
    lastMessageContent: message,
    lastMessageTime: newMessage.event_time,
  });
};

export { handleChatMessages, displayChatMessages, processUpdateMessageEvent };
