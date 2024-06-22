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

import authRouter from './routes/auth.mjs';
import usersRouter from './routes/users.mjs';

import {
  displayChatMessages,
  handleChatMessages,
  manageSocketConnections,
} from './handlers/socket-handlers.mjs';

const app = express();
const server = createServer(app);

app.set('view engine', 'ejs');
app.use(express.static('../../client/src/styles'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/users', usersRouter);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  connectionStateRecovery: {},
});

app.get('/', (req, res) => {
  if (req.session.passport && req.session.passport.user) {
    console.log(req.session.passport.user);
    res.send(`User ID: ${req.session.passport.user}`);
  } else {
    res.send('User not authenticated');
  }
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

    manageSocketConnections(socket);
    handleChatMessages(socket, io);
    displayChatMessages(socket);
  } else {
    socket.disconnect();
  }
});

const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
