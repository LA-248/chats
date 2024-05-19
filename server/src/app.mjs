import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);

app.set('view engine', 'ejs');
app.use(express.static('../../client/src/styles'));

const io = new Server(server, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  socket.on('chat message', (message) => {
    io.emit('chat message', message);
  });
});

const port = process.env.PORT;

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
