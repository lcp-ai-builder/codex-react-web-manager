import { useState } from 'react';
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
  useColorModeValue
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
  FiChevronUp
} from 'react-icons/fi';

const menuItems = [
  { icon: FiHome, label: '仪表盘' },
  {
    icon: FiUsers,
    label: '用户管理',
    children: [
      { icon: FiUser, label: '普通用户' },
      { icon: FiStar, label: 'VIP用户' }
    ]
  },
  { icon: FiSettings, label: '系统设置' }
];

const HomePage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({
    用户管理: true
  });
  const { colorMode, toggleColorMode } = useColorMode();
  const pageBg = useColorModeValue('gray.100', 'gray.900');
  const sidebarBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const infoBg = useColorModeValue('white', 'gray.800');
  const textMuted = useColorModeValue('gray.600', 'gray.400');
  const menuHover = useColorModeValue(
    { bg: 'teal.50', color: 'teal.500' },
    { bg: 'teal.900', color: 'teal.200' }
  );

  return (
    <Flex minH="100vh" bg={pageBg}>
      <Box
        as="nav"
        w={isCollapsed ? '88px' : { base: '260px', md: '300px' }}
        bg={sidebarBg}
        borderRight="1px solid"
        borderColor={borderColor}
        px={isCollapsed ? 4 : 6}
        py={8}
        transition="width 0.2s ease"
      >
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
        <List spacing={2}>
          {menuItems.map((item) => {
            const hasChildren = Boolean(item.children?.length);
            const isOpen = openMenus[item.label];

            const handleToggle = () => {
              if (!hasChildren || isCollapsed) return;
              setOpenMenus((prev) => ({
                ...prev,
                [item.label]: !prev[item.label]
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
                  onClick={handleToggle}
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
      <Flex direction="column" flex="1">
        <Flex
          as="header"
          h="72px"
          px={8}
          align="center"
          justify="space-between"
          bg={headerBg}
          borderBottom="1px solid"
          borderColor={borderColor}
        >
          <Heading size="md">欢迎回来</Heading>
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
            <Button leftIcon={<FiLogOut />} variant="outline" colorScheme="teal">
              退出
            </Button>
          </Flex>
        </Flex>
        <Box as="main" flex="1" p={8}>
          <Heading size="lg" mb={6}>
            仪表盘概览
          </Heading>
          <Flex gap={6} flexWrap="wrap">
            <InfoCard title="今日访问量" value="1,245" />
            <InfoCard title="新增用户" value="56" />
            <InfoCard title="待处理工单" value="8" />
          </Flex>
          <Box mt={10} bg={infoBg} borderRadius="lg" boxShadow="sm" p={6}>
            <Heading size="md" mb={4}>
              最近活动
            </Heading>
            <Text color={textMuted}>这里展示系统的最新动态与提醒。</Text>
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
};

const InfoCard = ({ title, value }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardShadow = useColorModeValue('sm', 'dark-lg');
  const labelColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Box
      flex="1"
      minW="240px"
      bg={cardBg}
      borderRadius="lg"
      boxShadow={cardShadow}
      p={6}
    >
      <Text fontSize="sm" color={labelColor}>
        {title}
      </Text>
      <Text fontSize="3xl" fontWeight="bold" mt={2}>
        {value}
      </Text>
    </Box>
  );
};

export default HomePage;
