import MessageInput from '../components/message-input.jsx';
import RoomInput from '../components/room-input.jsx';
import Logout from '../components/logout.jsx';
import { MessageList } from '../components/message-list.jsx';
import { MessageProvider } from '../components/message-context.jsx';

export default function Home() {
  return (
    <>
      <MessageProvider>
        <div className="main-container">
          <MessageList />
          <div className="input-container">
            <RoomInput />
            <MessageInput />
          </div>
          <Logout />
        </div>
      </MessageProvider>
    </>
  );
}
