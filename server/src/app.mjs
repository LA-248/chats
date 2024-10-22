import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import express from 'express';
import sharedSession from 'express-socket.io-session';
import passport from 'passport';
import configurePassport from './config/passport-auth-setup.mjs';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { sessionMiddleware } from './middlewares/session-middleware.mjs';
import { createTables, pool } from '../db/index.mjs';

// Import routers
import authRouter from './routes/auth.mjs';
import usersRouter from './routes/users.mjs';
import chatsRouter from './routes/chats.mjs';
import messagesRouter from './routes/messages.mjs';

import {
  displayChatMessages,
  handleChatMessages,
  manageSocketConnections,
  processUpdateMessageEvent,
  updateMessageReadStatus,
} from './handlers/socket-handlers.mjs';

const app = express();
const server = createServer(app);
const port = process.env.PORT || 4000;

app.set('view engine', 'ejs');
app.use(express.static('../../client/src/styles'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

configurePassport();
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Attach routes
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/chats', chatsRouter);
app.use('/messages', messagesRouter);

// Set up a Socket.IO server
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  connectionStateRecovery: {},
});

io.use(sharedSession(sessionMiddleware, { autoSave: true }));

io.on('connection', (socket) => {
  // Access the session
  console.log(socket.handshake.session);

  // Check if user is authenticated
  if (
    socket.handshake.session.passport &&
    socket.handshake.session.passport.user
  ) {
    const userId = socket.handshake.session.passport.user;
    console.log(`User connected`);
    console.log(`User ID: ${userId}`);
    console.log(socket.rooms);

    manageSocketConnections(socket);
    handleChatMessages(socket, io);

    socket.on('join-room', (room) => {
      socket.join(room);
      // Load messages for the room
      displayChatMessages(socket, room);
    });

    socket.on('leave-room', (room) => {
      socket.leave(room);
    });

    updateMessageReadStatus(socket, userId);
    processUpdateMessageEvent(socket, io);
  } else {
    socket.disconnect();
  }
});

createTables();

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
