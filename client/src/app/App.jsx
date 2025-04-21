import '../styles/App.css';
import AppRoutes from './routes/AppRoutes.jsx';
import Providers from './Providers.jsx';

function App() {
  return (
    <Providers>
      <AppRoutes />
    </Providers>
  );
}

export default App;
