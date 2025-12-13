/**
 * 主应用框架页面组件
 * 
 * 功能说明：
 * - 提供系统主界面布局，包含左侧导航菜单和右侧内容区域
 * - 支持侧边栏折叠/展开功能，提升空间利用率
 * - 基于用户权限动态显示菜单项（基于 rootMenus 权限系统）
 * - 支持多级菜单展开/收起
 * - 集成用户信息展示、语言切换、主题切换、退出登录等功能
 * 
 * 权限控制：
 * - admin 用户可以看到所有菜单
 * - 普通用户根据 rootMenus 数组决定可见菜单
 * - 系统管理相关菜单需要特定权限
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Avatar, Box, Button, Collapse, Flex, Heading, Icon, IconButton, List, ListItem, Select, Text, VStack, useColorMode, useColorModeValue } from '@chakra-ui/react';
import {
  FiHome,
  FiUsers,
  FiLogOut,
  FiMoon,
  FiSun,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiStar,
  FiChevronDown,
  FiChevronUp,
  FiTool,
  FiUserCheck,
  FiKey,
  FiActivity,
  FiLock,
  FiShoppingBag,
  FiList,
  FiSearch,
} from 'react-icons/fi';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '@/store/useAuthStore.js';

// 菜单图标颜色调色板：为不同菜单项分配不同颜色，提升视觉区分度
const accentPalette = ['teal.400', 'orange.400', 'purple.400', 'blue.400', 'pink.400', 'green.400'];

/**
 * 根据索引获取菜单图标颜色
 * @param {number} seed - 菜单项索引
 * @returns {string} Chakra UI 颜色值
 */
const getAccent = (seed = 0) => accentPalette[Math.abs(seed) % accentPalette.length];

// 菜单键名常量：用于标识不同类型的菜单项，便于状态管理
const MENU_KEYS = {
  dashboard: 'dashboard', // 仪表盘
  users: 'users', // 用户管理
  trades: 'trades', // 交易管理
  systemMaintenance: 'systemMaintenance', // 系统维护
  logs: 'logs', // 操作日志
};

const HomePage = () => {
  // ==================== Hooks 初始化 ====================
  // 国际化翻译 Hook
  const { t, i18n } = useTranslation();
  // 路由导航 Hook
  const navigate = useNavigate();
  const location = useLocation();
  // 主题模式 Hook
  const { colorMode, toggleColorMode } = useColorMode();
  
  // ==================== 状态管理 ====================
  // 侧边栏折叠状态：false 为展开，true 为折叠
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // ==================== 用户认证信息 ====================
  // 从 Zustand store 获取当前登录用户信息，如果不存在则使用默认值
  const currentUser = useAuthStore((state) => state.currentUser) || { id: 'admin', name: '管理员' };
  // 清除认证信息的函数
  const clearAuth = useAuthStore((state) => state.clearAuth);
  
  // ==================== 权限判断 ====================
  // 判断是否为管理员：通过用户 ID 是否为 'admin'（不区分大小写）
  const isAdmin = currentUser?.id?.toLowerCase?.() === 'admin';
  
  // 解析用户权限菜单列表：从后端返回的 rootMenus 中提取可访问的路径
  // 返回 null 表示未设置权限（默认允许访问），返回数组表示有权限限制
  const allowedRootMenus = useMemo(() => {
    if (currentUser?.rootMenus === undefined || currentUser?.rootMenus === null) return null;
    return Array.isArray(currentUser.rootMenus) ? currentUser.rootMenus : [];
  }, [currentUser?.rootMenus]);
  
  // 判断是否可以查看系统维护菜单：管理员或有 '/home/system' 权限
  const canSeeSystemMaintenance = isAdmin || (Array.isArray(allowedRootMenus) && allowedRootMenus.includes('/home/system'));
  // 判断是否可以查看操作日志菜单：管理员或有 '/home/system/logs' 权限
  const canSeeSystemLogs = isAdmin || (Array.isArray(allowedRootMenus) && allowedRootMenus.includes('/home/system/logs'));
  
  // ==================== 菜单展开状态 ====================
  // 初始化菜单展开状态：默认展开用户管理和交易管理菜单
  // 系统维护和日志菜单根据权限决定是否展开
  const getInitialOpenMenus = () => ({
    [MENU_KEYS.users]: true, // 用户管理菜单默认展开
    [MENU_KEYS.trades]: true, // 交易管理菜单默认展开
    ...(canSeeSystemMaintenance ? { [MENU_KEYS.systemMaintenance]: true } : {}),
    ...(canSeeSystemLogs ? { [MENU_KEYS.logs]: true } : {}),
  });
  const [openMenus, setOpenMenus] = useState(getInitialOpenMenus);
  
  // ==================== 主题颜色配置 ====================
  // 使用 useColorModeValue 实现亮色/暗色模式自适应
  const pageBg = useColorModeValue('gray.100', 'gray.900'); // 页面背景色
  const sidebarBg = useColorModeValue('white', 'gray.800'); // 侧边栏背景色
  const headerBg = useColorModeValue('white', 'gray.800'); // 顶部导航背景色
  const borderColor = useColorModeValue('gray.200', 'gray.700'); // 边框颜色
  const textMuted = useColorModeValue('gray.600', 'gray.400'); // 次要文字颜色
  // 菜单项悬停效果颜色
  const menuHover = useColorModeValue({ bg: 'teal.100', color: 'teal.700' }, { bg: 'teal.800', color: 'teal.100' });
  
  // ==================== 用户信息 ====================
  // 当前用户角色名称（去除首尾空格）
  const currentRoleName = typeof currentUser?.roleName === 'string' ? currentUser.roleName.trim() : '';
  // 当前语言设置
  const currentLanguage = i18n.language;
  
  // ==================== 事件处理函数 ====================
  /**
   * 退出登录处理函数
   * 功能：清除本地存储的认证信息，并跳转到登录页
   */
  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  // ==================== 副作用处理 ====================
  /**
   * 当权限状态变化时，重新初始化菜单展开状态
   * 依赖：canSeeSystemLogs, canSeeSystemMaintenance
   */
  useEffect(() => {
    setOpenMenus(getInitialOpenMenus());
  }, [canSeeSystemLogs, canSeeSystemMaintenance]);

  // ==================== 菜单配置 ====================
  /**
   * 基础菜单项配置：所有用户都可以看到的基础菜单
   * 包含：仪表盘、用户管理、交易管理
   */
  const baseMenuItems = useMemo(
    () => [
      // 仪表盘：首页入口
      { id: MENU_KEYS.dashboard, icon: FiHome, label: t('menu.dashboard'), path: '/home' },
      // 用户管理：包含普通用户和 VIP 用户（VIP 用户功能暂未实现）
      {
        id: MENU_KEYS.users,
        icon: FiUsers,
        label: t('menu.users'),
        rootPath: '/home/users', // 权限检查路径
        children: [
          { id: `${MENU_KEYS.users}-regular`, icon: FiUser, label: t('menu.regularUsers'), path: '/home/users/regular' },
          { id: `${MENU_KEYS.users}-vip`, icon: FiStar, label: t('menu.vipUsers') }, // 暂未实现
        ],
      },
      // 交易管理：包含交易概览和交易查询
      {
        id: MENU_KEYS.trades,
        icon: FiShoppingBag,
        label: t('menu.trades'),
        rootPath: '/home/trades',
        children: [
          { id: `${MENU_KEYS.trades}-overview`, icon: FiList, label: t('menu.tradeOverview'), path: '/home/trades/overview' },
          { id: `${MENU_KEYS.trades}-query`, icon: FiSearch, label: t('menu.tradeQuery'), path: '/home/trades/query' },
        ],
      },
    ],
    [t]
  );

  /**
   * 系统维护菜单：需要管理员或系统维护权限
   * 包含：操作员管理、角色管理、密码重置
   */
  const adminMenu = useMemo(
    () => ({
      id: MENU_KEYS.systemMaintenance,
      icon: FiTool,
      label: t('menu.systemMaintenance'),
      rootPath: '/home/system',
      children: [
        { id: `${MENU_KEYS.systemMaintenance}-operator`, icon: FiUserCheck, label: t('menu.operator'), path: '/home/system/operator' },
        { id: `${MENU_KEYS.systemMaintenance}-roles`, icon: FiKey, label: t('menu.roles'), path: '/home/system/roles' },
        { id: `${MENU_KEYS.systemMaintenance}-password`, icon: FiLock, label: t('menu.password'), path: '/home/system/password' },
      ],
    }),
    [t]
  );

  /**
   * 操作日志菜单：需要管理员或操作日志权限
   * 包含：操作日志查看
   */
  const systemLogMenu = useMemo(
    () => ({
      id: MENU_KEYS.logs,
      icon: FiActivity,
      label: t('menu.logs'),
      rootPath: '/home/system/logs',
      children: [{ id: `${MENU_KEYS.logs}-operation`, icon: FiActivity, label: t('menu.operationLogs'), path: '/home/system/logs' }],
    }),
    [t]
  );

  /**
   * 菜单项权限过滤函数
   * 判断逻辑：
   * 1. 管理员可以看到所有菜单
   * 2. 如果 allowedRootMenus 为 null（未设置权限），默认允许访问
   * 3. 如果菜单项没有 rootPath（如仪表盘），默认允许访问
   * 4. 否则检查 allowedRootMenus 中是否包含该菜单的 rootPath
   * 
   * @param {Object} item - 菜单项对象
   * @returns {boolean} 是否应该显示该菜单项
   */
  const shouldIncludeMenu = useCallback(
    (item) => {
      if (isAdmin) return true; // 管理员拥有所有权限
      if (allowedRootMenus === null) return true; // 未设置权限时默认允许
      if (!item.rootPath) return true; // 没有权限要求的菜单项默认允许
      return allowedRootMenus.includes(item.rootPath); // 检查是否在权限列表中
    },
    [allowedRootMenus, isAdmin]
  );

  /**
   * 最终菜单项列表：根据权限过滤后的菜单
   * 处理逻辑：
   * 1. 先过滤基础菜单项
   * 2. 根据权限决定是否添加系统日志菜单
   * 3. 根据权限决定是否添加系统维护菜单
   */
  const menuItems = useMemo(() => {
    const items = baseMenuItems.filter(shouldIncludeMenu);
    // 按顺序添加特殊菜单，确保菜单顺序正确
    if (canSeeSystemLogs && shouldIncludeMenu(systemLogMenu)) {
      items.push(systemLogMenu);
    }
    if (canSeeSystemMaintenance && shouldIncludeMenu(adminMenu)) {
      items.push(adminMenu);
    }
    return items;
  }, [adminMenu, baseMenuItems, canSeeSystemLogs, canSeeSystemMaintenance, shouldIncludeMenu, systemLogMenu]);

  /**
   * 菜单路径到标签的映射表
   * 用途：根据当前路由路径快速查找对应的菜单标签，用于顶部导航显示当前位置
   * 处理：递归遍历所有菜单项（包括子菜单），建立路径到标签的映射
   */
  const menuPathLabelMap = useMemo(() => {
    const map = {};
    /**
     * 递归收集菜单路径和标签
     * @param {Array} items - 菜单项数组
     */
    const collect = (items) => {
      items.forEach((item) => {
        if (item.path) {
          map[item.path] = item.label;
        }
        if (item.children) {
          collect(item.children);
        }
      });
    };
    collect(menuItems);
    return map;
  }, [menuItems]);

  // ==================== 路由相关 ====================
  // 规范化当前路径：去除末尾的斜杠
  const currentPath = location.pathname.length > 1 && location.pathname.endsWith('/') ? location.pathname.slice(0, -1) : location.pathname;
  // 根据当前路径获取对应的菜单标签，如果找不到则使用仪表盘标签
  const currentLabel = menuPathLabelMap[currentPath] ?? t('menu.dashboard');
  /**
   * 判断路径是否激活（当前路由是否匹配或包含该路径）
   * 用于高亮显示当前所在的菜单项
   * @param {string} path - 要检查的路径
   * @returns {boolean} 是否激活
   */
  const isActivePath = (path) => path && currentPath.startsWith(path);

  // ==================== 渲染组件 ====================
  return (
    <Flex h="100vh" bg={pageBg} overflow="hidden">
      {/* ========== 左侧导航栏 ========== */}
      <Box
        as="nav"
        // 响应式宽度：折叠时固定 76px，展开时根据屏幕尺寸自适应
        w={
          isCollapsed
            ? '76px' // 折叠状态：仅显示图标
            : {
                base: 'clamp(220px, 52vw, 270px)', // 小屏幕：最小 220px，最大 270px
                md: 'clamp(250px, 32vw, 300px)', // 中等屏幕：最小 250px，最大 300px
                lg: 'clamp(270px, 24vw, 320px)', // 大屏幕：最小 270px，最大 320px
              }
        }
        bg={sidebarBg}
        borderRight="1px solid"
        borderColor={borderColor}
        px={isCollapsed ? 4 : 6} // 折叠时减少内边距
        py={8}
        position="sticky" // 固定定位，滚动时保持可见
        top={0}
        height="100vh"
        overflowY="auto" // 内容超出时可滚动
        transition="width 0.2s ease" // 宽度变化动画
      >
        {/* 侧边栏顶部区域：显示标题和折叠按钮 */}
        <Flex align="center" justify={isCollapsed ? 'center' : 'space-between'} mb={8} gap={4}>
          {/* 标题：折叠时隐藏 */}
          {!isCollapsed && (
            <Heading size="md" whiteSpace="nowrap">
              管理后台
            </Heading>
          )}
          {/* 折叠/展开按钮 */}
          <IconButton
            aria-label={isCollapsed ? '展开菜单' : '收起菜单'}
            icon={isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
            onClick={() => setIsCollapsed((prev) => !prev)}
            size="sm"
            variant="ghost"
            colorScheme="teal"
          />
        </Flex>
        
        {/* 菜单列表区域：支持多级菜单、悬停效果和展开/收起 */}
        <List spacing={2}>
          {menuItems.map((item, index) => {
            // 判断是否有子菜单
            const hasChildren = Boolean(item.children?.length);
            // 菜单项唯一标识
            const menuKey = item.id || item.label;
            // 当前菜单项的展开状态
            const isOpen = openMenus[menuKey];

            /**
             * 切换菜单展开/收起状态
             * 注意：折叠状态下不响应展开/收起操作
             */
            const handleToggle = () => {
              if (!hasChildren || isCollapsed) return;
              setOpenMenus((prev) => ({
                ...prev,
                [menuKey]: !prev[menuKey],
              }));
            };

            return (
              <Box key={menuKey}>
                {/* 一级菜单项 */}
                <ListItem
                  display="flex"
                  alignItems="center"
                  justifyContent={isCollapsed ? 'center' : 'flex-start'} // 折叠时居中，展开时左对齐
                  gap={isCollapsed ? 0 : 3}
                  px={isCollapsed ? 2 : 3}
                  py={2}
                  borderRadius="md"
                  cursor="pointer"
                  _hover={menuHover} // 悬停效果
                  onClick={() => {
                    // 如果有路径，直接跳转；否则切换展开状态
                    if (item.path) {
                      navigate(item.path);
                      return;
                    }
                    handleToggle();
                  }}
                >
                  {/* 菜单图标：使用调色板中的颜色 */}
                  <Icon as={item.icon} boxSize={5} color={getAccent(index)} />
                  {/* 菜单标签：折叠时隐藏 */}
                  <Text fontWeight="medium" display={isCollapsed ? 'none' : 'block'}>
                    {item.label}
                  </Text>
                  {/* 展开/收起指示图标：仅在有子菜单且未折叠时显示 */}
                  {!isCollapsed && hasChildren && <Icon as={isOpen ? FiChevronUp : FiChevronDown} boxSize={4} ml="auto" />}
                </ListItem>
                
                {/* 子菜单：使用 Collapse 组件实现展开/收起动画 */}
                {!isCollapsed && hasChildren && (
                  <Collapse in={isOpen} animateOpacity>
                    <List spacing={1} mt={1} pl={7}>
                      {item.children.map((child, childIndex) => (
                        <ListItem
                          key={child.id || child.label}
                          display="flex"
                          alignItems="center"
                          gap={3}
                          px={3}
                          py={2}
                          borderRadius="md"
                          cursor="pointer"
                          _hover={menuHover}
                          // 如果当前路径匹配，使用激活样式
                          bg={isActivePath(child.path) ? menuHover.bg : 'transparent'}
                          color={isActivePath(child.path) ? menuHover.color : 'inherit'}
                          onClick={() => child.path && navigate(child.path)}
                        >
                          {/* 子菜单图标 */}
                          <Icon as={child.icon} boxSize={4} color={getAccent(index + childIndex + 1)} />
                          <Text fontSize="sm">{child.label}</Text>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </List>
      </Box>
      
      {/* ========== 右侧主内容区域 ========== */}
      <Flex direction="column" flex="1" minH="100vh" overflow="hidden">
        {/* 顶部导航栏：固定定位，包含当前位置、用户信息和操作按钮 */}
        <Flex
          as="header"
          h="72px"
          px={8}
          align="center"
          justify="space-between"
          bg={headerBg}
          borderBottom="1px solid"
          borderColor={borderColor}
          position="sticky" // 固定定位，滚动时保持可见
          top={0}
          zIndex={1} // 确保在其他内容之上
        >
          {/* 当前位置显示 */}
          <Heading size="md">{t('menu.location', { label: currentLabel })}</Heading>
          
          {/* 右侧操作区域 */}
          <Flex align="center" gap={4}>
            {/* 语言切换下拉框 */}
            <Select
              size="sm"
              value={currentLanguage}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              w="110px"
              variant="outline"
            >
              <option value="en">{t('language.en')}</option>
              <option value="zh-CN">{t('language.zh')}</option>
            </Select>
            
            {/* 主题切换按钮：亮色/暗色模式 */}
            <IconButton
              aria-label="切换配色模式"
              icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
              onClick={toggleColorMode}
              variant="ghost"
              colorScheme="teal"
            />
            
            {/* 用户头像 */}
            <Avatar size="sm" name={currentUser?.name || currentUser?.id} />
            
            {/* 用户信息：显示用户名和角色 */}
            <VStack spacing={0} align="flex-start">
              <Text fontWeight="medium">{currentUser?.name || currentUser?.id || '未登录用户'}</Text>
              {currentRoleName && (
                <Text fontSize="sm" color={textMuted}>
                  {currentRoleName}
                </Text>
              )}
            </VStack>
            
            {/* 退出登录按钮 */}
            <Button leftIcon={<FiLogOut />} variant="outline" colorScheme="teal" onClick={handleLogout}>
              {t('action.logout')}
            </Button>
          </Flex>
        </Flex>
        
        {/* 主内容区域：使用 Outlet 渲染子路由组件 */}
        <Box as="main" flex="1" p={8} overflowY="auto">
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
};


export default HomePage;
