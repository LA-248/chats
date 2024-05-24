import { io } from 'https://cdn.socket.io/4.7.5/socket.io.esm.min.js';

const socket = io('http://localhost:8080', {
  auth: {
    serverOffset: 0,
  },
});

/*
const socket = io('http://localhost:8080', {
  auth: {
    serverOffset: 0,
  },
  ackTimeout: 10000,
  retries: 3,
});
*/

export default socket;
