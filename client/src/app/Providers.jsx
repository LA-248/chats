import { BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from '../contexts/UserContext.jsx';
import { ChatProvider } from '../contexts/ChatContext.jsx';
import { MessageProvider } from '../contexts/MessageContext.jsx';
import { Toaster } from 'sonner';

export default function Providers({ children }) {
  return (
    <UserProvider>
      <ChatProvider>
        <MessageProvider>
          <Router>
            <Toaster position='top-center' richColors={true} />
            {children}
          </Router>
        </MessageProvider>
      </ChatProvider>
    </UserProvider>
  );
}
