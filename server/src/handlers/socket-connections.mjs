// Store user-to-socket mappings in a hash map
// This allows for socket connections to be associated with the correct user
export default function manageSocketConnections(socket, userSockets) {
  socket.on('authenticate', (userId) => {
    userSockets.set(userId, socket.id);

    socket.on('disconnect', () => {
      if (userSockets.get(userId) === socket.id) {
        userSockets.delete(userId);
      }
    });

    console.log(userSockets);
  });
}
