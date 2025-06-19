import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { Chat } from '../../../types/chat';

interface UpdatePayload {
  [key: string]: string | number;
}

// TODO: REFACTOR THIS MESS
export default function useChatUpdates<T>(
  socket: Socket,
  setChatList: React.Dispatch<React.SetStateAction<Chat[]>>,
  matchField: keyof Chat,
  eventKey: string,
  matchKey: keyof Chat,
  updateField: string,
  room: string,
  setData: React.Dispatch<React.SetStateAction<T>>,
  socketEvent: string
) {
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (data: UpdatePayload): void => {
      setChatList((prevChatList): Chat[] =>
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
        setData(data[updateField] as T);
      }
    };

    socket.on(socketEvent, handleUpdate);
    return () => {
      socket.off(socketEvent, handleUpdate);
    };
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
