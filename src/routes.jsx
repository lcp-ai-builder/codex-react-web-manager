import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '@/pages/Login.jsx';
import HomePage from '@/pages/Home.jsx';
import DashboardPage from '@/pages/Dashboard.jsx';
import RegularUsersPage from '@/pages/RegularUsers.jsx';
import MaintenancePage from '@/pages/MaintenancePage.jsx';
import RolesPage from '@/pages/Roles.jsx';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LoginPage />} />
    <Route path="/home" element={<HomePage />}>
      <Route index element={<DashboardPage />} />
      <Route path="users/regular" element={<RegularUsersPage />} />
      <Route
        path="system/users"
        element={<MaintenancePage title="用户管理" />}
      />
      <Route
        path="system/roles"
        element={<RolesPage />}
      />
      <Route
        path="system/menus"
        element={<MaintenancePage title="菜单管理" />}
      />
      <Route
        path="system/permissions"
        element={<MaintenancePage title="权限分配" />}
      />
      <Route path="system/logs" element={<MaintenancePage title="操作日志" />} />
      <Route
        path="system/password"
        element={<MaintenancePage title="修改密码" />}
      />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
