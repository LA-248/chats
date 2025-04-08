import { useEffect } from 'react';

export default function useChatUpdates(
	socket,
	setChatList,
	matchField,
	eventKey,
	matchKey,
	updateField,
	room,
	setData,
	socketEvent
) {
	useEffect(() => {
		if (!socket) return;

		const handleUpdate = (data) => {
			setChatList((prevChatList) =>
				prevChatList.map((chat) =>
					chat[matchField] === data[eventKey]
						? { ...chat, [matchKey]: data[updateField] }
						: chat
				)
			);
			// Update other components where the data is also displayed, such as the contact header and chat info modal
			// Since these components exist in the chat view, only update them in real-time if the user currently has -
			// the chat where the update occurred open
			if (room === data.room) {
				setData(data[updateField]);
			}
		};

		socket.on(socketEvent, handleUpdate);
		return () => socket.off(socketEvent, handleUpdate);
	}, [
		socket,
		setChatList,
		matchField,
		eventKey,
		matchKey,
		updateField,
		room,
		setData,
		socketEvent,
	]);
}
