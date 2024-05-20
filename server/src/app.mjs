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
  socket.on('chat message', (message) => {
    try {
      db.run('INSERT INTO messages (content) VALUES (?)', [message], (err) => {
        if (err) {
          console.error('Error inserting message into the database:', err.message);
          return;
        }
      });
    } catch (error) {
      console.error('Unexpected error:', error.message);
      return;
    }

    io.emit('chat message', message);
  });

  try {
    db.each('SELECT content FROM messages', (err, row) => {
      if (err) {
        console.error('Error retrieving message content:', err.message);
        return;
      }

      socket.emit('chat message', row.content);
    });
  } catch (error) {
    console.error('Unexpected error:', error.message);
    return;
  }
});

const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
