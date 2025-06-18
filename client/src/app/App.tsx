import '../styles/App.css';
import AppRoutes from './routes/AppRoutes';
import Providers from './Providers';

function App() {
  return (
    <Providers>
      <AppRoutes />
    </Providers>
  );
}

export default App;
