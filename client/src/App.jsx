import './styles/App.css';
import MessageInput from './components/message-input.jsx';
import { MessageList } from './components/message-list.jsx';
import { MessageProvider } from './components/message-context.jsx';
import RoomInput from './components/room-input.jsx';

function App() {
  return (
    <MessageProvider>
      <div className="main-container">
        <MessageList />
        <div className="input-container">
          <RoomInput />
          <MessageInput />
        </div>
      </div>
    </MessageProvider>
  );
}

export default App;
