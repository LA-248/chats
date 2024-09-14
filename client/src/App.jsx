import './styles/App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home.jsx';
import SignUp from './pages/sign-up.jsx';
import Login from './pages/login.jsx';
import Settings from './pages/settings.jsx';
import ProtectedRoutes from './utils/ProtectedRoutes.jsx';
import { ChatView } from './components/ChatView.jsx';
import { ChatProvider } from './contexts/ChatContext.jsx';
import { MessageProvider } from './contexts/MessageContext.jsx';

function App() {
  return (
    <ChatProvider>
      <MessageProvider>
        <Router>
          <div>
            <div>
              <Routes>
                <Route path="/register" element={<SignUp />} />
                <Route path="/login" element={<Login />} />

                <Route element={<ProtectedRoutes />}>
                  <Route path="/" element={<Home />}>
                    <Route path="messages/:room" element={<ChatView />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                </Route>
              </Routes>
            </div>
          </div>
        </Router>
      </MessageProvider>
    </ChatProvider>
  );
}

export default App;
