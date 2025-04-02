import { useEffect } from 'react';

export default function useChatUpdates(
	socket,
	setChatList,
	matchField,
	eventKey,
	matchKey,
	updateField,
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
			setData(data[updateField]);
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
		setData,
		socketEvent,
	]);
}
