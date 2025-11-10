import { Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/Login.jsx';
import HomePage from '@/pages/Home.jsx';
import DashboardPage from '@/pages/Dashboard.jsx';
import RegularUsersPage from '@/pages/RegularUsers.jsx';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />}>
        <Route index element={<DashboardPage />} />
        <Route path="users/regular" element={<RegularUsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
