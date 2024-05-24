import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { db } from './services/database.mjs';

const app = express();
const server = createServer(app);

app.set('view engine', 'ejs');
app.use(express.static('../../client/src/styles'));

const io = new Server(server, {
  cors: { origin: '*' },
  connectionStateRecovery: {},
});

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  console.log(socket.rooms);

  socket.on('join-room', room => {
    socket.join(room);
    console.log(`User ${socket.id} joined the room ${room}.`);
    console.log(socket.rooms);
  });

  socket.on('leave-room', room => {
    socket.leave(room);
    console.log(`User ${socket.id} left the room ${room}.`);
    console.log(socket.rooms);
  });

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
});

const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
