import dotenv from 'dotenv';
dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '../.env.test' : '../.env',
});

import express from 'express';
import cors from 'cors';
import passport from 'passport';
import configurePassport from './config/passport-auth-setup.ts';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import sharedSession from 'express-socket.io-session';

import { sessionMiddleware } from './middlewares/session.middleware.ts';
import { createTables } from '../db/index.ts';
import { socketHandlers } from './handlers/socket-handlers.ts';

import authRouter from './routes/auth.routes.ts';
import usersRouter from './routes/user.routes.ts';
import privateChatsRouter from './routes/private-chat.routes.ts';
import groupChatsRouter from './routes/group-chat.routes.ts';
import messagesRouter from './routes/message.routes.ts';

export const app = express();
const server = createServer(app);
const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

configurePassport();

app.use(express.static('../../client/public'));

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/chats', privateChatsRouter);
app.use('/groups', groupChatsRouter);
app.use('/messages', messagesRouter);

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
socketHandlers(io);

createTables();

if (process.env.NODE_ENV === 'development') {
  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}
