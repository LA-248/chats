import './styles/App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home.jsx';
import SignUp from './pages/sign-up.jsx';
import Login from './pages/login.jsx';
import Settings from './pages/settings.jsx';
import ProtectedRoutes from './utils/ProtectedRoutes.jsx';
import { ChatView } from './components/chat/ChatView.jsx';
import { UserProvider } from './contexts/UserContext.jsx';
import { ChatProvider } from './contexts/ChatContext.jsx';
import { MessageProvider } from './contexts/MessageContext.jsx';
import { Toaster } from 'sonner';

function App() {
  return (
    <UserProvider>
      <ChatProvider>
        <MessageProvider>
          <Router>
            <Toaster position='top-center' richColors={true} />
            <Routes>
              <Route path='/register' element={<SignUp />} />
              <Route path='/login' element={<Login />} />

              <Route element={<ProtectedRoutes />}>
                <Route path='/' element={<Home />}>
                  <Route path='/chats/:room' element={<ChatView />} />
                  <Route path='/groups/:room' element={<ChatView />} />
                  <Route path='/settings' element={<Settings />} />
                </Route>
              </Route>
            </Routes>
          </Router>
        </MessageProvider>
      </ChatProvider>
    </UserProvider>
  );
}

export default App;
