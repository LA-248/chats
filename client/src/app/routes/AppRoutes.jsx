import { Routes, Route } from 'react-router-dom';

import Home from '../../pages/home.jsx';
import SignUp from '../../pages/sign-up.jsx';
import Login from '../../pages/login.jsx';
import Settings from '../../pages/settings.jsx';
import ProtectedRoutes from './ProtectedRoutes.jsx';
import { ChatView } from '../../features/conversations/components/ChatView.jsx';

export default function AppRoutes() {
  return (
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
  );
}
