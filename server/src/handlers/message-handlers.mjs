import { PrivateChat } from '../models/private-chat-model.mjs';
import { Message } from '../models/message-model.mjs';
import isSenderBlocked from '../utils/check-blocked-status.mjs';

const handleChatMessages = (socket, io) => {
  socket.on('chat-message', async (data, clientOffset, callback) => {
    const { username, recipientId, message } = data;
    const senderId = socket.handshake.session.passport.user;

    // Create a consistent room name using user IDs
    // Ensure the room is the same for both users by sorting the user IDs
    const room = [senderId, recipientId].sort().join('-');

    try {
      // Check if sender is blocked
      await checkIfBlocked(recipientId, senderId);

      const newMessage = await saveMessageInDatabase(
        message,
        senderId,
        recipientId,
        room,
        clientOffset
      );

      restoreRecipientChat(recipientId, room);
      broadcastMessage(io, room, username, message, senderId, newMessage);
    } catch (error) {
      if (
        error.message ===
        'You cannot send messages to this user because they have you blocked'
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

// Handle sending updated last message info for the chat list after a delete or edit
const updateMostRecentMessage = (socket, io) => {
  socket.on('last-message-updated', async (room) => {
    try {
      const lastMessageInfo = await Message.retrieveLastMessageInfo(room);
      io.to(room).emit('last-message-updated', {
        room: room,
        lastMessageContent: lastMessageInfo ? lastMessageInfo.content : null,
        lastMessageTime: lastMessageInfo ? lastMessageInfo.event_time : null,
      });
    } catch (error) {
      console.error('Error updating chat list:', error.message);
      socket.emit('custom-error', {
        error: `There was an error updating your chat list. Please refresh the page.`,
      });
      return;
    }
  });
};

// TODO: Don't retrieve the whole message list after a message is deleted or edited - optimise it
// Listen for message deletes and edits, and emit the updated message list to the relevant room
const updateMessageListEvent = (socket, io) => {
  socket.on('message-list-update-event', async (room, updateType) => {
    try {
      const messages = await Message.retrieveMessageList(
        socket.handshake.auth.serverOffset,
        room
      );
      io.to(room).emit('message-list-update-event', {
        room: room,
        updatedMessageList: messages.map(formatMessage),
      });
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

const checkIfBlocked = async (recipientId, senderId) => {
  try {
    await isSenderBlocked(recipientId, senderId);
  } catch (error) {
    throw new Error(
      'You cannot send messages to this user because they have you blocked'
    );
  }
};

const saveMessageInDatabase = async (
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

// Mark the recipient's chat as not deleted in the database on incoming message if it was previously marked as deleted
const restoreRecipientChat = async (recipientId, room) => {
  const isNotInChatList = await PrivateChat.retrieveChatDeletionStatus(
    recipientId,
    room
  );
  if (isNotInChatList.user_deleted === true) {
    await PrivateChat.updateChatDeletionStatus(recipientId, false, room);
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
    userDeleted: false,
  });
};

export {
  handleChatMessages,
  displayChatMessages,
  updateMostRecentMessage,
  updateMessageListEvent,
};
