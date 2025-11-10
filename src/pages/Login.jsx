import { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Text,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();
  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardShadow = useColorModeValue('lg', 'dark-lg');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');

  // 这里只做 Demo，因此模拟登录行为
  const handleLogin = (event) => {
    event.preventDefault();
    setLoading(true);
    // simulate auth flow
    setTimeout(() => {
      setLoading(false);
      navigate('/home');
    }, 500);
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg={pageBg} px={4}>
      <Box
        as="form"
        onSubmit={handleLogin}
        bg={cardBg}
        p={10}
        borderRadius="lg"
        boxShadow={cardShadow}
        w="full"
        maxW="md"
      >
        <Flex align="center" justify="space-between" mb={6}>
          <Heading size="lg">管理系统登录</Heading>
          <IconButton
            aria-label="切换配色模式"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            colorScheme="teal"
            /* 允许用户在登录页就体验暗色/亮色切换 */
          />
        </Flex>
        <FormControl id="email" mb={4}>
          <FormLabel>邮箱</FormLabel>
          <Input type="email" placeholder="admin@example.com" required />
        </FormControl>
        <FormControl id="password" mb={6}>
          <FormLabel>密码</FormLabel>
          <Input type="password" placeholder="请输入密码" required />
        </FormControl>
        <Button
          type="submit"
          colorScheme="teal"
          w="full"
          size="lg"
          isLoading={loading}
        >
          登录
        </Button>
        <Text fontSize="sm" color={subTextColor} textAlign="center" mt={4}>
          使用任意账户信息即可体验示例系统
        </Text>
      </Box>
    </Flex>
  );
};

export default LoginPage;
