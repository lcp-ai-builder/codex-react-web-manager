// 统一声明前端路由表，方便后续按需扩展/守卫
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
    {/* /home 作为主框架，其余页面全部嵌套在 Outlet 中 */}
    <Route path="/home" element={<HomePage />}>
      <Route index element={<DashboardPage />} />
      <Route path="users/regular" element={<RegularUsersPage />} />
      <Route path="system/operator" element={<MaintenancePage title="操作员管理" />} />
      <Route path="system/roles" element={<RolesPage />} />
      <Route path="system/menus" element={<MaintenancePage title="菜单管理" />} />
      <Route path="system/permissions" element={<MaintenancePage title="权限分配" />} />
      <Route path="system/logs" element={<MaintenancePage title="操作日志" />} />
      <Route path="system/password" element={<MaintenancePage title="修改密码" />} />
    </Route>
    {/* 未匹配路径兜底重定向到登录页 */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
