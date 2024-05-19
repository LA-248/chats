import './styles/App.css';
import MessageInput from './components/message-input.jsx';
import { MessageList } from './components/message-list.jsx';
import { MessageProvider } from './components/message-context.jsx';

function App() {
  return (
    <MessageProvider>
      <div className="main-container">
        <MessageInput />
        <MessageList />
      </div>
    </MessageProvider>
  );
}

export default App;
