import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import express from 'express';
import sharedSession from 'express-socket.io-session';
import passport from 'passport';
import configurePassport from './config/passport-auth-setup.js';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { sessionMiddleware } from './middlewares/session.middleware.js';
import { createTables, pool } from '../db/index.js';
import { socketHandlers } from './handlers/socket-handlers.js';

// Import routers
import authRouter from './routes/auth.routes.js';
import usersRouter from './routes/user.routes.js';
import privateChatsRouter from './routes/private-chats.routes.js';
import groupChatsRouter from './routes/group-chats.routes.js';
import messagesRouter from './routes/message.routes.js';

const app = express();
const server = createServer(app);
const port = process.env.PORT || 4000;

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

app.set('io', io);
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
app.use('/chats', privateChatsRouter);
app.use('/groups', groupChatsRouter);
app.use('/messages', messagesRouter);

socketHandlers(io);
createTables();

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
