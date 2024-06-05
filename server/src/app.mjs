import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import express from 'express';
import sharedSession from 'express-socket.io-session';
import passport from 'passport';
import configurePassport from './config/passport-auth-setup.mjs';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { sessionMiddleware } from './middlewares/session-middleware.mjs';

import authRouter from './routes/auth.mjs';
import {
  displayChatMessages,
  handleChatMessages,
  handleJoiningRoom,
  handleLeavingRoom,
} from './handlers/socket-handlers.mjs';

const app = express();
const server = createServer(app);

app.set('view engine', 'ejs');
app.use(express.static('../../client/src/styles'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

configurePassport();
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Attach routes
app.use('/auth', authRouter);

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
  if (socket.handshake.session.passport && socket.handshake.session.passport.user) {
    const userId = socket.handshake.session.passport.user;
    console.log(`User connected`);
    console.log(`User ID: ${userId}`);
    console.log(socket.rooms);
  
    handleJoiningRoom(socket);
    handleLeavingRoom(socket);
    handleChatMessages(socket);
    displayChatMessages(socket);

  } else {
    socket.disconnect();
  }
});

const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
