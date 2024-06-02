import './styles/App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home.jsx';
import SignUp from './pages/sign-up.jsx';
import Login from './pages/login.jsx';
import ProtectedRoutes from './utils/ProtectedRoutes.jsx';

function App() {
  return (
    <Router>
      <div>
        <div>
          <Routes>
            <Route path="/register" element={<SignUp />} />
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoutes />}>
              <Route path="/" element={<Home />} />
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
