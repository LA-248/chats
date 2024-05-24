import { useContext } from 'react';
import { MessageContext } from './message-context';
import socket from './socket';

export default function RoomInput() {
  let { room, setRoom, connectedRoom, setConnectedRoom } = useContext(MessageContext);

  const submitRoomName = (event) => {
    event.preventDefault();

    if (room) {
      socket.emit('join-room', room);
      setConnectedRoom(connectedRoom = room);
    }
  };

  const leaveRoom = (event) => {
    event.preventDefault();
    socket.emit('leave-room', connectedRoom);
    setConnectedRoom('');
  }

  return (
    <div>
      <div className='connected-room'>{connectedRoom.length > 0 ? <div>Connected to room: {connectedRoom}</div> : null}</div>
      <form id="room-form" action="" onSubmit={submitRoomName}>
        <div className="room-input-container">
          <input
            id="room-input"
            type="text"
            placeholder="Enter a room name"
            value={room}
            onChange={(event) => setRoom(event.target.value)}
          />
          <button className="join-room-button">Join</button>
          {connectedRoom.length > 0 ? <button className="leave-room-button" onClick={leaveRoom}>Leave</button> : null}
        </div>
      </form>
    </div>
  );
}
