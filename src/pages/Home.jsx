import { useCallback, useEffect, useMemo, useState } from 'react';
import { Avatar, Box, Button, Collapse, Flex, Heading, Icon, IconButton, List, ListItem, Text, VStack, useColorMode, useColorModeValue } from '@chakra-ui/react';
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
import useAuthStore from '@/store/useAuthStore.js';

const accentPalette = ['teal.400', 'orange.400', 'purple.400', 'blue.400', 'pink.400', 'green.400'];
const getAccent = (seed = 0) => accentPalette[Math.abs(seed) % accentPalette.length];

const HomePage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();
  const currentUser = useAuthStore((state) => state.currentUser) || { id: 'admin', name: '管理员' };
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const isAdmin = currentUser?.id?.toLowerCase?.() === 'admin';
  const allowedRootMenus = useMemo(() => {
    if (currentUser?.rootMenus === undefined || currentUser?.rootMenus === null) return null;
    return Array.isArray(currentUser.rootMenus) ? currentUser.rootMenus : [];
  }, [currentUser?.rootMenus]);
  const canSeeSystemMaintenance = isAdmin || (Array.isArray(allowedRootMenus) && allowedRootMenus.includes('/home/system'));
  const canSeeSystemLogs = isAdmin || (Array.isArray(allowedRootMenus) && allowedRootMenus.includes('/home/system/logs'));
  const [openMenus, setOpenMenus] = useState({
    用户管理: true,
    交易信息: true,
    ...(canSeeSystemMaintenance ? { 系统维护: true } : {}),
    ...(canSeeSystemLogs ? { 系统日志信息: true } : {}),
  });
  const pageBg = useColorModeValue('gray.100', 'gray.900');
  const sidebarBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textMuted = useColorModeValue('gray.600', 'gray.400');
  const menuHover = useColorModeValue({ bg: 'teal.100', color: 'teal.700' }, { bg: 'teal.800', color: 'teal.100' });
  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  useEffect(() => {
    setOpenMenus({
      用户管理: true,
      交易信息: true,
      ...(canSeeSystemMaintenance ? { 系统维护: true } : {}),
      ...(canSeeSystemLogs ? { 系统日志信息: true } : {}),
    });
  }, [canSeeSystemLogs, canSeeSystemMaintenance]);

  const baseMenuItems = useMemo(
    () => [
      { icon: FiHome, label: '仪表盘', path: '/home' },
      {
        icon: FiUsers,
        label: '用户管理',
        rootPath: '/home/users',
        children: [
          { icon: FiUser, label: '普通用户', path: '/home/users/regular' },
          { icon: FiStar, label: 'VIP用户' },
        ],
      },
      {
        icon: FiShoppingBag,
        label: '交易信息',
        rootPath: '/home/trades',
        children: [
          { icon: FiList, label: '交易概览', path: '/home/trades/overview' },
          { icon: FiSearch, label: '交易查询', path: '/home/trades/query' },
        ],
      },
    ],
    []
  );

  const adminMenu = useMemo(
    () => ({
      icon: FiTool,
      label: '系统维护',
      rootPath: '/home/system',
      children: [
        { icon: FiUserCheck, label: '操作员管理', path: '/home/system/operator' },
        { icon: FiKey, label: '角色管理', path: '/home/system/roles' },
        { icon: FiLock, label: '修改密码', path: '/home/system/password' },
      ],
    }),
    []
  );

  const systemLogMenu = useMemo(
    () => ({
      icon: FiActivity,
      label: '系统日志信息',
      rootPath: '/home/system/logs',
      children: [{ icon: FiActivity, label: '操作日志', path: '/home/system/logs' }],
    }),
    []
  );

  const shouldIncludeMenu = useCallback(
    (item) => {
      if (isAdmin) return true;
      if (allowedRootMenus === null) return true;
      if (!item.rootPath) return true;
      return allowedRootMenus.includes(item.rootPath);
    },
    [allowedRootMenus, isAdmin]
  );

  // 左侧菜单定义：支持多级、图标和路由跳转；基于 root_menus 做过滤
  const menuItems = useMemo(() => {
    const items = baseMenuItems.filter(shouldIncludeMenu);
    if (canSeeSystemMaintenance && shouldIncludeMenu(adminMenu)) {
      items.push(adminMenu);
    }
    if (canSeeSystemLogs && shouldIncludeMenu(systemLogMenu)) {
      items.push(systemLogMenu);
    }
    return items;
  }, [adminMenu, baseMenuItems, canSeeSystemLogs, canSeeSystemMaintenance, shouldIncludeMenu, systemLogMenu]);

  // 将菜单项拍平成 path->label 映射，方便抬头展示“当前位置”
  const menuPathLabelMap = useMemo(() => {
    const map = {};
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

  const currentPath = location.pathname.length > 1 && location.pathname.endsWith('/') ? location.pathname.slice(0, -1) : location.pathname;
  const currentLabel = menuPathLabelMap[currentPath] ?? '仪表盘';
  const isActivePath = (path) => path && currentPath.startsWith(path);

  return (
    <Flex h="100vh" bg={pageBg} overflow="hidden">
      <Box
        as="nav"
        w={
          isCollapsed
            ? '76px'
            : {
                base: 'clamp(160px, 44vw, 200px)',
                md: 'clamp(180px, 24vw, 220px)',
                lg: 'clamp(200px, 18vw, 240px)',
              }
        }
        bg={sidebarBg}
        borderRight="1px solid"
        borderColor={borderColor}
        px={isCollapsed ? 4 : 6}
        py={8}
        position="sticky"
        top={0}
        height="100vh"
        overflowY="auto"
        transition="width 0.2s ease"
      >
        {/* 侧边栏顶部：标题 + 折叠按钮 */}
        <Flex align="center" justify={isCollapsed ? 'center' : 'space-between'} mb={8} gap={4}>
          {!isCollapsed && (
            <Heading size="md" whiteSpace="nowrap">
              管理后台
            </Heading>
          )}
          <IconButton
            aria-label={isCollapsed ? '展开菜单' : '收起菜单'}
            icon={isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
            onClick={() => setIsCollapsed((prev) => !prev)}
            size="sm"
            variant="ghost"
            colorScheme="teal"
          />
        </Flex>
        {/* 菜单区域，支持 hover 反馈和二级折叠 */}
        <List spacing={2}>
          {menuItems.map((item, index) => {
            const hasChildren = Boolean(item.children?.length);
            const isOpen = openMenus[item.label];

            const handleToggle = () => {
              if (!hasChildren || isCollapsed) return;
              setOpenMenus((prev) => ({
                ...prev,
                [item.label]: !prev[item.label],
              }));
            };

            return (
              <Box key={item.label}>
                <ListItem
                  display="flex"
                  alignItems="center"
                  justifyContent={isCollapsed ? 'center' : 'flex-start'}
                  gap={isCollapsed ? 0 : 3}
                  px={isCollapsed ? 2 : 3}
                  py={2}
                  borderRadius="md"
                  cursor="pointer"
                  _hover={menuHover}
                  onClick={() => {
                    if (item.path) {
                      navigate(item.path);
                      return;
                    }
                    handleToggle();
                  }}
                >
                  <Icon as={item.icon} boxSize={5} color={getAccent(index)} />
                  <Text fontWeight="medium" display={isCollapsed ? 'none' : 'block'}>
                    {item.label}
                  </Text>
                  {!isCollapsed && hasChildren && <Icon as={isOpen ? FiChevronUp : FiChevronDown} boxSize={4} ml="auto" />}
                </ListItem>
                {!isCollapsed && hasChildren && (
                  <Collapse in={isOpen} animateOpacity>
                    <List spacing={1} mt={1} pl={7}>
                      {item.children.map((child, childIndex) => (
                        <ListItem
                          key={child.label}
                          display="flex"
                          alignItems="center"
                          gap={3}
                          px={3}
                          py={2}
                          borderRadius="md"
                          cursor="pointer"
                          _hover={menuHover}
                          bg={isActivePath(child.path) ? menuHover.bg : 'transparent'}
                          color={isActivePath(child.path) ? menuHover.color : 'inherit'}
                          onClick={() => child.path && navigate(child.path)}
                        >
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
      {/* 右侧主区域：顶部固定，下面 Outlet 滚动 */}
      <Flex direction="column" flex="1" minH="100vh" overflow="hidden">
        <Flex as="header" h="72px" px={8} align="center" justify="space-between" bg={headerBg} borderBottom="1px solid" borderColor={borderColor} position="sticky" top={0} zIndex={1}>
          <Heading size="md">当前位置：{currentLabel}</Heading>
          <Flex align="center" gap={4}>
            <IconButton aria-label="切换配色模式" icon={colorMode === 'light' ? <FiMoon /> : <FiSun />} onClick={toggleColorMode} variant="ghost" colorScheme="teal" />
            <Avatar size="sm" name={currentUser?.name || currentUser?.id} />
            <VStack spacing={0} align="flex-start">
              <Text fontWeight="medium">{currentUser?.name || currentUser?.id || '未登录用户'}</Text>
              <Text fontSize="sm" color={textMuted}>
                {currentUser?.email || 'admin@example.com'}
              </Text>
            </VStack>
            <Button leftIcon={<FiLogOut />} variant="outline" colorScheme="teal" onClick={handleLogout}>
              退出
            </Button>
          </Flex>
        </Flex>
        <Box as="main" flex="1" p={8} overflowY="auto">
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
};

export default HomePage;
