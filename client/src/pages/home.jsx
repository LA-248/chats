import MessageInput from '../components/MessageInput.jsx';
import RoomInput from '../components/RoomInput.jsx';
import Logout from '../components/UserLogout.jsx';
import { MessageList } from '../components/MessageList.jsx';
import { MessageProvider } from '../components/MessageContext.jsx';

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
