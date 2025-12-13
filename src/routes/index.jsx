// 系统管理后台路由配置 - 2025年12月
// 业务领域：用户管理、系统管理、交易管理
// 路由设计原则：基于角色权限控制，模块化分组
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Flex, Alert, AlertIcon, AlertTitle, useColorModeValue } from '@chakra-ui/react';
import LoginPage from '@/pages/Login.jsx';
import HomePage from '@/pages/Home.jsx';
import DashboardPage from '@/pages/Dashboard.jsx';
import RegularUsersPage from '@/pages/RegularUsers.jsx';
import MaintenancePage from '@/pages/MaintenancePage.jsx';
import RolesPage from '@/pages/Roles.jsx';
import OperatorsPage from '@/pages/Operators.jsx';
import ResetPasswordPage from '@/pages/ResetPassword.jsx';
import TradeQueryPage from '@/pages/TradeQuery.jsx';
import TradeOverviewPage from '@/pages/TradeOverview.jsx';
import useAuthStore from '@/store/useAuthStore.js';

// 项目路由常量配置 - 与后端API路径保持一致
export const ROUTES = {
  // 公共路由
  LOGIN: '/login',
  // 主应用路由
  HOME: '/home',
  DASHBOARD: '/home',
  // 用户管理路由
  REGULAR_USERS: '/home/users/regular',
  // 系统管理路由
  OPERATORS: '/home/system/operator',
  ROLES: '/home/system/roles',
  SYSTEM_LOGS: '/home/system/logs',
  RESET_PASSWORD: '/home/system/password',
  // 交易管理路由
  TRADE_OVERVIEW: '/home/trades/overview',
  TRADE_QUERY: '/home/trades/query',
};

// 路由权限配置 - 基于RBAC模型和 rootMenus 权限系统
// 权限说明：
// - admin: 系统管理员（id 为 'admin'），拥有所有权限
// - rootMenus: 基于后端返回的 rootMenus 数组控制权限
//   - 空数组 []: 所有登录用户都可以访问
//   - 包含路径: 需要 rootMenus 中包含对应路径才能访问
export const ROUTE_PERMISSIONS = {
  [ROUTES.DASHBOARD]: [], // 所有登录用户都可以访问
  [ROUTES.REGULAR_USERS]: [], // 所有登录用户都可以访问
  [ROUTES.OPERATORS]: ['/home/system'], // 需要系统管理权限
  [ROUTES.ROLES]: ['/home/system'], // 需要系统管理权限
  [ROUTES.SYSTEM_LOGS]: ['/home/system/logs'], // 需要操作日志权限
  [ROUTES.RESET_PASSWORD]: [], // 所有登录用户都可以访问
  [ROUTES.TRADE_OVERVIEW]: [], // 所有登录用户都可以访问
  [ROUTES.TRADE_QUERY]: [], // 所有登录用户都可以访问
};

/**
 * 路由加载组件
 * 用途：在路由切换或权限验证过程中显示加载状态
 * 显示：居中显示加载动画和提示文字，支持暗色模式
 */
const RouteLoader = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  
  return (
    <Flex justify="center" align="center" minH="70vh" bg={bgColor}>
      <Box textAlign="center">
        <CircularProgress size="100px" thickness="4px" color="teal.500" isIndeterminate />
        <Box mt={4} color={textColor} fontSize="lg">加载中，请稍候...</Box>
      </Box>
    </Flex>
  );
};

/**
 * 路由错误处理组件
 * 用途：当路由加载失败或发生错误时显示友好的错误提示
 * @param {Object} error - 错误对象，包含 message 和 stack 属性
 * @param {string} error.message - 错误消息
 * @param {string} error.stack - 错误堆栈（仅在开发环境显示）
 */
const RouteError = ({ error }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  
  return (
    <Flex justify="center" align="center" minH="70vh" p={4} bg={bgColor}>
      <Box width="100%" maxWidth="600px">
        <Alert status="error" variant="subtle" borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>页面加载失败</AlertTitle>
            <Box mt={2}>{error?.message || '页面加载时发生错误，请刷新重试'}</Box>
            {/* 开发环境下显示错误堆栈的第一行，便于调试 */}
            {process.env.NODE_ENV === 'development' && error?.stack && (
              <Box mt={2} fontSize="sm" color="red.600">
                {error.stack.split('\n')[0]}
              </Box>
            )}
          </Box>
        </Alert>
      </Box>
    </Flex>
  );
};

/**
 * 路由守卫组件
 * 功能：保护需要认证的路由，验证用户登录状态、角色权限和账户状态
 * 
 * 验证流程：
 * 1. 检查登录状态 - 未登录则重定向到登录页
 * 2. 检查角色权限 - 基于 rootMenus 数组验证用户是否有权限访问该路由
 *    - admin 用户拥有所有权限
 *    - 其他用户需要 rootMenus 中包含对应路径
 * 
 * @param {React.ReactNode} children - 需要保护的路由组件
 * @param {string[]} requiredPaths - 访问该路由所需的路径列表，空数组表示所有登录用户都可访问
 * @returns {React.ReactNode} 通过验证则渲染子组件，否则重定向到相应页面
 */
const ProtectedRoute = ({ children, requiredPaths = [] }) => {
  const { token, currentUser } = useAuthStore();
  const location = useLocation();
  
  // 开发环境：记录路由访问日志
  if (process.env.NODE_ENV === 'development') {
    console.log(`[ROUTE-GUARD] 访问路由: ${location.pathname}, 用户: ${currentUser?.id || '未登录'}`);
  }
  
  // 未登录用户重定向到登录页，并记录来源地址
  if (!token || !currentUser) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }
  
  // 检查用户权限是否符合要求
  if (requiredPaths.length > 0) {
    const isAdmin = currentUser?.id?.toLowerCase?.() === 'admin';
    const allowedRootMenus = Array.isArray(currentUser?.rootMenus) ? currentUser.rootMenus : [];
    
    // admin 用户拥有所有权限
    if (isAdmin) {
      return children;
    }
    
    // 检查 rootMenus 中是否包含所需路径
    const hasPermission = requiredPaths.some((path) => allowedRootMenus.includes(path));
    
    // 权限验证失败处理
    if (!hasPermission) {
      // 开发环境：记录权限验证失败日志
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[ROUTE-GUARD] 权限验证失败: ${location.pathname}, 用户: ${currentUser?.id}, 要求路径: ${requiredPaths.join(', ')}, 用户权限: ${allowedRootMenus.join(', ')}`
        );
      }
      // 重定向到仪表盘
      return <Navigate to={ROUTES.DASHBOARD} state={{ permissionDenied: true }} replace />;
    }
  }
  
  return children;
};

/**
 * 应用路由配置组件
 * 功能：定义整个应用的路由结构，包括公共路由、受保护路由和错误处理
 * 
 * 路由结构：
 * - 登录页：无需认证即可访问
 * - 主应用框架：需要登录，包含所有业务模块
 *   - 仪表盘：默认首页
 *   - 用户管理：普通用户管理
 *   - 系统管理：操作员、角色、日志、密码重置（部分需要特定权限）
 *   - 交易管理：交易概览、交易查询
 * - 404 路由：处理不存在的路径
 * 
 * 权限控制：
 * - 使用 ProtectedRoute 组件包装需要认证的路由
 * - 通过 requiredPaths 参数控制基于 rootMenus 的权限
 * - 所有路由都配置了 errorElement 用于错误处理
 */
const AppRoutes = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  
  return (
    <Routes>
      {/* 登录页 - 无需权限，所有用户都可以访问 */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      
      {/* 
        主应用框架 - 登录后访问
        使用 ProtectedRoute 包装，确保只有登录用户才能访问
        所有子路由都会继承这个保护
      */}
      <Route
        path={ROUTES.HOME}
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
        errorElement={<RouteError error={{ message: '主应用框架加载失败' }} />}
      >
        {/* 仪表盘 - 默认页 */}
        <Route
          index
          element={<DashboardPage />}
          errorElement={<RouteError error={{ message: '仪表盘加载失败' }} />}
        />

        {/* 用户管理模块 */}
        <Route
          path="users/regular"
          element={<RegularUsersPage />}
          errorElement={<RouteError error={{ message: '普通用户管理页面加载失败' }} />}
        />

        {/* 系统管理模块 - 需要特定权限 */}
        <Route
          path="system/operator"
          element={
            <ProtectedRoute requiredPaths={ROUTE_PERMISSIONS[ROUTES.OPERATORS]}>
              <OperatorsPage />
            </ProtectedRoute>
          }
          errorElement={<RouteError error={{ message: '操作员管理页面加载失败' }} />}
        />

        <Route
          path="system/roles"
          element={
            <ProtectedRoute requiredPaths={ROUTE_PERMISSIONS[ROUTES.ROLES]}>
              <RolesPage />
            </ProtectedRoute>
          }
          errorElement={<RouteError error={{ message: '角色管理页面加载失败' }} />}
        />

        <Route
          path="system/logs"
          element={
            <ProtectedRoute requiredPaths={ROUTE_PERMISSIONS[ROUTES.SYSTEM_LOGS]}>
              <MaintenancePage title="操作日志" />
            </ProtectedRoute>
          }
          errorElement={<RouteError error={{ message: '操作日志页面加载失败' }} />}
        />

        <Route
          path="system/password"
          element={<ResetPasswordPage />}
          errorElement={<RouteError error={{ message: '密码重置页面加载失败' }} />}
        />

        {/* 交易管理模块 */}
        <Route
          path="trades/overview"
          element={<TradeOverviewPage />}
          errorElement={<RouteError error={{ message: '交易概览页面加载失败' }} />}
        />
        <Route
          path="trades/query"
          element={<TradeQueryPage />}
          errorElement={<RouteError error={{ message: '交易查询页面加载失败' }} />}
        />

        {/* 旧路由兼容重定向 - 处理用户收藏夹和旧链接 */}
        <Route path="orders/*" element={<Navigate to={ROUTES.TRADE_OVERVIEW} replace />} />
        <Route path="user/*" element={<Navigate to={ROUTES.REGULAR_USERS} replace />} />
      </Route>

      {/* 默认路由重定向 - 根路径直接进入仪表盘 */}
      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

      {/* 404 路由 - 处理不存在的路径 */}
      <Route
        path="*"
        element={
          <Flex justify="center" align="center" minH="70vh" p={4} bg={bgColor}>
            <Box width="100%" maxWidth="600px">
              <Alert status="info" variant="subtle" borderRadius="md">
                <AlertIcon />
                <Box flex="1">
                  <AlertTitle>页面不存在</AlertTitle>
                  <Box mt={2}>您访问的页面不存在或已被移除</Box>
                </Box>
              </Alert>
            </Box>
          </Flex>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
