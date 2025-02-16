import {
	displayChatMessages,
	handleChatMessages,
	updateMostRecentMessage,
	updateMessageListEvent,
} from './message-handlers.mjs';
import {
	initialiseChatRooms,
	manageSocketConnections,
} from './socket-connections.mjs';

const userSockets = new Map();

// Listen for new client connections to the server and set up client-specific socket event handlers
const socketHandlers = (io) => {
	io.on('connection', (socket) => {
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

			initialiseChatRooms(socket);
			manageSocketConnections(socket, userSockets);

			handleChatMessages(socket, io, userSockets);
			updateMostRecentMessage(socket, io);
			updateMessageListEvent(socket, io);

			socket.on('open-chat', (room) => {
				displayChatMessages(socket, room);
			});

			socket.on('leave-room', (room) => {
				socket.leave(room);
			});
		} else {
			socket.disconnect();
		}
	});
};

export { socketHandlers };
