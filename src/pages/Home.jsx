import { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Flex,
  Heading,
  Icon,
  IconButton,
  List,
  ListItem,
  Text,
  VStack,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiHome,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiMoon,
  FiSun,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiStar,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

// 左侧菜单定义：支持多级、图标和路由跳转
const menuItems = [
  { icon: FiHome, label: '仪表盘', path: '/home' },
  {
    icon: FiUsers,
    label: '用户管理',
    children: [
      { icon: FiUser, label: '普通用户', path: '/home/users/regular' },
      { icon: FiStar, label: 'VIP用户' }
    ]
  },
  { icon: FiSettings, label: '系统设置' },
];

const HomePage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({
    用户管理: true,
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();
  const pageBg = useColorModeValue('gray.100', 'gray.900');
  const sidebarBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textMuted = useColorModeValue('gray.600', 'gray.400');
  const menuHover = useColorModeValue(
    { bg: 'teal.50', color: 'teal.500' },
    { bg: 'teal.900', color: 'teal.200' }
  );

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
  }, []);

  const currentPath =
    location.pathname.length > 1 && location.pathname.endsWith('/')
      ? location.pathname.slice(0, -1)
      : location.pathname;
  const currentLabel = menuPathLabelMap[currentPath] ?? '仪表盘';

  return (
    <Flex h="100vh" bg={pageBg} overflow="hidden">
      <Box
        as="nav"
        w={isCollapsed ? '88px' : { base: '260px', md: '300px' }}
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
        <Flex
          align="center"
          justify={isCollapsed ? 'center' : 'space-between'}
          mb={8}
          gap={4}
        >
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
          {menuItems.map((item) => {
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
                  <Icon as={item.icon} boxSize={5} />
                  <Text
                    fontWeight="medium"
                    display={isCollapsed ? 'none' : 'block'}
                  >
                    {item.label}
                  </Text>
                  {!isCollapsed && hasChildren && (
                    <Icon
                      as={isOpen ? FiChevronUp : FiChevronDown}
                      boxSize={4}
                      ml="auto"
                    />
                  )}
                </ListItem>
                {!isCollapsed && hasChildren && (
                  <Collapse in={isOpen} animateOpacity>
                    <List spacing={1} mt={1} pl={7}>
                      {item.children.map((child) => (
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
                          onClick={() => child.path && navigate(child.path)}
                        >
                          <Icon as={child.icon} boxSize={4} />
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
        <Flex
          as="header"
          h="72px"
          px={8}
          align="center"
          justify="space-between"
          bg={headerBg}
          borderBottom="1px solid"
          borderColor={borderColor}
          position="sticky"
          top={0}
          zIndex={1}
        >
          <Heading size="md">当前位置：{currentLabel}</Heading>
          <Flex align="center" gap={4}>
            <IconButton
              aria-label="切换配色模式"
              icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
              onClick={toggleColorMode}
              variant="ghost"
              colorScheme="teal"
            />
            <Avatar size="sm" name="管理员" />
            <VStack spacing={0} align="flex-start">
              <Text fontWeight="medium">管理员</Text>
              <Text fontSize="sm" color={textMuted}>
                admin@example.com
              </Text>
            </VStack>
            <Button
              leftIcon={<FiLogOut />}
              variant="outline"
              colorScheme="teal"
            >
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
