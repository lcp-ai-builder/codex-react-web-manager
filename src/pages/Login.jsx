import { useState } from 'react';
import { Box, Button, Flex, FormControl, FormLabel, Heading, IconButton, Input, useColorMode, useColorModeValue, useToast } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { login } from '@/services/manager-service.js';
import { hashPassword } from '@/components/hash-password';
import useAuthStore from '@/store/useAuthStore.js';

const LoginPage = () => {
  const navigate = useNavigate();
  const isDev = import.meta.env.MODE === 'development';
  const [userId, setUserId] = useState(isDev ? 'admin' : '');
  const [password, setPassword] = useState(isDev ? 'aaaaaa' : '');
  const [loading, setLoading] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardShadow = useColorModeValue('lg', 'dark-lg');
  const setAuth = useAuthStore((state) => state.setAuth);

  const isFormValid = userId.trim().length > 0 && password.trim().length > 0;

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const hashedPassword = await hashPassword(password);
      const data = await login({ userId, password: hashedPassword });

      if (data.success) {
        const parsedRootMenus = (() => {
          if (Array.isArray(data?.rootMenus)) return data.rootMenus;
          if (typeof data?.rootMenus === 'string') {
            try {
              const parsed = JSON.parse(data.rootMenus);
              if (Array.isArray(parsed)) return parsed;
            } catch (err) {
              console.warn('Failed to parse rootMenus from login response', err);
            }
          }
          return [];
        })();
        // 持久化当前登录人，方便首页判断是否为 admin
        setAuth({
          token: data?.token || '',
          user: {
            id: userId,
            name: data?.operatorName || data?.name || userId,
            roleId: data?.roleId,
            roleName: data?.roleName,
            roleCode: data?.roleCode,
            rootMenus: parsedRootMenus,
          },
        });
        navigate('/home');
      } else {
        const message = data?.message || '登录失败，请重试';
        toast({
          title: message,
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
      }
    } catch (err) {
      console.error('登录请求失败：', err);
      const message = err?.payload?.message || err?.payload?.error || (typeof err?.message === 'string' ? err.message : '登录请求失败，请稍后重试');
      toast({
        title: message,
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
      <Box as="form" onSubmit={handleLogin} bg={cardBg} p={10} borderRadius="lg" boxShadow={cardShadow} w="full" maxW="md">
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
        <FormControl id="userId" mb={4}>
          <FormLabel>用户ID</FormLabel>
          <Input placeholder="请输入用户ID" value={userId} onChange={(e) => setUserId(e.target.value)} required />
        </FormControl>
        <FormControl id="password" mb={6}>
          <FormLabel>密码</FormLabel>
          <Input type="password" placeholder="请输入密码" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </FormControl>
        <Button type="submit" colorScheme="teal" w="full" size="lg" isLoading={loading} isDisabled={!isFormValid || loading}>
          登录
        </Button>
      </Box>
    </Flex>
  );
};

export default LoginPage;
