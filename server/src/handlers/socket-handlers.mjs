import { db } from "../services/database.mjs";

const handleJoiningRoom = (socket) => {
  socket.on('join-room', room => {
    socket.join(room);
    console.log(`User ${socket.id} joined the room ${room}.`);
    console.log(socket.rooms);
  });
}

const handleLeavingRoom = (socket) => {
  socket.on('leave-room', room => {
    socket.leave(room);
    console.log(`User ${socket.id} left the room ${room}.`);
    console.log(socket.rooms);
  });
}

const handleChatMessages = (socket, io) => {
  socket.on('chat-message', (data, clientOffset, callback) => {
    const { room, message } = data;
    let result;

    try {
      result = db.run('INSERT INTO messages (content, room, client_offset) VALUES (?, ?, ?)', [message, room, clientOffset]);
      console.log(`Message received: ${message} in room: ${room}`);
      io.to(room).emit('chat-message', message, result.lastID);
      callback();
    } catch (error) {
      if (error.errno === 19) {
        // The message was already inserted, so we notify the client
        callback();
      }
      return;
    }
  });
}

const displayChatMessages = (socket) => {
  if (!socket.recovered) {
    try {
      db.each('SELECT content FROM messages WHERE id > ?', [socket.handshake.auth.serverOffset || 0], (_err, row) => {
        socket.emit('chat-message', row.content, row.id);
      });
    } catch (error) {
      console.error('Unexpected error:', error.message);
      return;
    }
  }
}

export {
  handleJoiningRoom,
  handleLeavingRoom,
  handleChatMessages,
  displayChatMessages,
};
