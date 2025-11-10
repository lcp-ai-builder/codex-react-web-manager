import { Navigate, Route, Routes } from 'react-router-dom';
// 集中管理所有页面路由，方便之后拆分和扩展
import LoginPage from '@/pages/Login.jsx';
import HomePage from '@/pages/Home.jsx';
import DashboardPage from '@/pages/Dashboard.jsx';
import RegularUsersPage from '@/pages/RegularUsers.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      {/* 登录页单独占用了根路径 */}
      <Route path="/" element={<LoginPage />} />
      {/* /home 作为后台整体框架，并通过嵌套路由展示内容区域 */}
      <Route path="/home" element={<HomePage />}>
        {/* index 表示 /home 默认展示仪表盘内容 */}
        <Route index element={<DashboardPage />} />
        {/* 嵌套出普通用户列表页面 */}
        <Route path="users/regular" element={<RegularUsersPage />} />
      </Route>
      {/* 兜底路由：找不到地址时重定向到登录 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
