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
  useToast,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/config/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('zhang3');
  const [password, setPassword] = useState('aaaaaa');
  const [loading, setLoading] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardShadow = useColorModeValue('lg', 'dark-lg');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        navigate('/home');
      } else {
        toast({
          title: '登录失败，请重试',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
      }
    } catch (err) {
      toast({
        title: '登录请求失败，请稍后重试',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
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
          />
        </Flex>
        <FormControl id="userId" mb={4}>
          <FormLabel>用户ID</FormLabel>
          <Input
            placeholder="请输入用户ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </FormControl>
        <FormControl id="password" mb={6}>
          <FormLabel>密码</FormLabel>
          <Input
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
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
      </Box>
    </Flex>
  );
};

export default LoginPage;
