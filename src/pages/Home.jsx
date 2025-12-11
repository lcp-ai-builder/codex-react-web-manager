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

const accentPalette = ['teal.400', 'orange.400', 'purple.400', 'blue.400', 'pink.400', 'green.400'];
const getAccent = (seed = 0) => accentPalette[Math.abs(seed) % accentPalette.length];
const MENU_KEYS = {
  dashboard: 'dashboard',
  users: 'users',
  trades: 'trades',
  systemMaintenance: 'systemMaintenance',
  logs: 'logs',
};

const HomePage = () => {
  const { t, i18n } = useTranslation();
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
  const getInitialOpenMenus = () => ({
    [MENU_KEYS.users]: true,
    [MENU_KEYS.trades]: true,
    ...(canSeeSystemMaintenance ? { [MENU_KEYS.systemMaintenance]: true } : {}),
    ...(canSeeSystemLogs ? { [MENU_KEYS.logs]: true } : {}),
  });
  const [openMenus, setOpenMenus] = useState(getInitialOpenMenus);
  const pageBg = useColorModeValue('gray.100', 'gray.900');
  const sidebarBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textMuted = useColorModeValue('gray.600', 'gray.400');
  const currentRoleName = typeof currentUser?.roleName === 'string' ? currentUser.roleName.trim() : '';
  const currentLanguage = i18n.language;
  const menuHover = useColorModeValue({ bg: 'teal.100', color: 'teal.700' }, { bg: 'teal.800', color: 'teal.100' });
  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  useEffect(() => {
    setOpenMenus(getInitialOpenMenus());
  }, [canSeeSystemLogs, canSeeSystemMaintenance]);

  const baseMenuItems = useMemo(
    () => [
      { id: MENU_KEYS.dashboard, icon: FiHome, label: t('menu.dashboard'), path: '/home' },
      {
        id: MENU_KEYS.users,
        icon: FiUsers,
        label: t('menu.users'),
        rootPath: '/home/users',
        children: [
          { id: `${MENU_KEYS.users}-regular`, icon: FiUser, label: t('menu.regularUsers'), path: '/home/users/regular' },
          { id: `${MENU_KEYS.users}-vip`, icon: FiStar, label: t('menu.vipUsers') },
        ],
      },
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
    if (canSeeSystemLogs && shouldIncludeMenu(systemLogMenu)) {
      items.push(systemLogMenu);
    }
    if (canSeeSystemMaintenance && shouldIncludeMenu(adminMenu)) {
      items.push(adminMenu);
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
  const currentLabel = menuPathLabelMap[currentPath] ?? t('menu.dashboard');
  const isActivePath = (path) => path && currentPath.startsWith(path);

  return (
    <Flex h="100vh" bg={pageBg} overflow="hidden">
      <Box
        as="nav"
        w={
          isCollapsed
            ? '76px'
            : {
                base: 'clamp(220px, 52vw, 270px)',
                md: 'clamp(250px, 32vw, 300px)',
                lg: 'clamp(270px, 24vw, 320px)',
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
            const menuKey = item.id || item.label;
            const isOpen = openMenus[menuKey];

            const handleToggle = () => {
              if (!hasChildren || isCollapsed) return;
              setOpenMenus((prev) => ({
                ...prev,
                [menuKey]: !prev[menuKey],
              }));
            };

            return (
              <Box key={menuKey}>
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
                          key={child.id || child.label}
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
          <Heading size="md">{t('menu.location', { label: currentLabel })}</Heading>
          <Flex align="center" gap={4}>
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
            <IconButton aria-label="切换配色模式" icon={colorMode === 'light' ? <FiMoon /> : <FiSun />} onClick={toggleColorMode} variant="ghost" colorScheme="teal" />
            <Avatar size="sm" name={currentUser?.name || currentUser?.id} />
            <VStack spacing={0} align="flex-start">
              <Text fontWeight="medium">{currentUser?.name || currentUser?.id || '未登录用户'}</Text>
              {currentRoleName ? (
                <Text fontSize="sm" color={textMuted}>
                  {currentRoleName}
                </Text>
              ) : null}
            </VStack>
            <Button leftIcon={<FiLogOut />} variant="outline" colorScheme="teal" onClick={handleLogout}>
              {t('action.logout')}
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
