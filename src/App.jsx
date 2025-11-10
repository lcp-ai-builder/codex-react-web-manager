import { Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login.jsx';
import HomePage from './pages/Home.jsx';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
