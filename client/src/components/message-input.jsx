import { useContext } from 'react';
import { socket } from './message-list';
import { MessageContext } from './message-context';

export default function MessageInput() {
  const { messages, message, setMessage } = useContext(MessageContext);
  let counter = 0;
  
  const handleSubmit = (event) => {
    event.preventDefault();
    // Compute a unique offset
    const clientOffset = `${socket.id}-${counter++}`;
    socket.emit('chat message', message, clientOffset); // Send the message to the server
    setMessage('');
  };

  return (
    <div>
      <ul id="messages">
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      <form id="form" action="" onSubmit={handleSubmit}>
        <input
          id="input"
          type="text"
          placeholder="Type your message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button>Send</button>
      </form>
    </div>
  );
}
