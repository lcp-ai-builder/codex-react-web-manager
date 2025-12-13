/**
 * 登录页面组件
 * 
 * 功能说明：
 * - 用户身份认证入口
 * - 支持用户ID和密码登录
 * - 密码使用 SHA-256 加密后发送到后端
 * - 登录成功后保存认证信息并跳转到首页
 * - 支持亮色/暗色主题切换
 * 
 * 开发环境：
 * - 自动填充默认账号（admin/aaaaaa）便于开发测试
 */
import { useState } from 'react';
import { Box, Button, Flex, FormControl, FormLabel, Heading, IconButton, Input, useColorMode, useColorModeValue, useToast } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { login } from '@/services/manager-service.js';
import { hashPassword } from '@/components/hash-password';
import useAuthStore from '@/store/useAuthStore.js';

const LoginPage = () => {
  // ==================== Hooks 初始化 ====================
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  // ==================== 状态管理 ====================
  // 判断是否为开发环境
  const isDev = import.meta.env.MODE === 'development';
  // 用户ID输入框状态：开发环境自动填充 'admin'
  const [userId, setUserId] = useState(isDev ? 'admin' : '');
  // 密码输入框状态：开发环境自动填充 'aaaaaa'
  const [password, setPassword] = useState(isDev ? 'aaaaaa' : '');
  // 登录请求加载状态
  const [loading, setLoading] = useState(false);
  
  // ==================== 主题颜色配置 ====================
  const pageBg = useColorModeValue('gray.50', 'gray.900'); // 页面背景色
  const cardBg = useColorModeValue('white', 'gray.800'); // 登录卡片背景色
  const cardShadow = useColorModeValue('lg', 'dark-lg'); // 卡片阴影

  // ==================== 表单验证 ====================
  // 检查表单是否有效：用户ID和密码都不能为空
  const isFormValid = userId.trim().length > 0 && password.trim().length > 0;

  /**
   * 登录处理函数
   * 流程：
   * 1. 阻止表单默认提交行为
   * 2. 使用 SHA-256 加密密码
   * 3. 发送登录请求到后端
   * 4. 解析返回的权限菜单（rootMenus）
   * 5. 保存认证信息到 Zustand store
   * 6. 跳转到首页
   * 
   * @param {Event} event - 表单提交事件
   */
  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    
    try {
      // 步骤1：使用 SHA-256 加密密码（前端加密，后端验证）
      const hashedPassword = await hashPassword(password);
      
      // 步骤2：发送登录请求
      const data = await login({ userId, password: hashedPassword });

      // 步骤3：处理登录成功响应
      if (data.success) {
        /**
         * 解析权限菜单（rootMenus）
         * 后端可能返回数组或 JSON 字符串，需要统一处理
         */
        const parsedRootMenus = (() => {
          // 如果已经是数组，直接返回
          if (Array.isArray(data?.rootMenus)) return data.rootMenus;
          // 如果是字符串，尝试解析为 JSON
          if (typeof data?.rootMenus === 'string') {
            try {
              const parsed = JSON.parse(data.rootMenus);
              if (Array.isArray(parsed)) return parsed;
            } catch (err) {
              console.warn('Failed to parse rootMenus from login response', err);
            }
          }
          // 解析失败或不存在，返回空数组
          return [];
        })();
        
        // 步骤4：保存认证信息到全局状态
        // 包含：token、用户基本信息、角色信息、权限菜单
        setAuth({
          token: data?.token || '',
          user: {
            id: userId,
            name: data?.operatorName || data?.name || userId, // 优先使用 operatorName
            roleId: data?.roleId, // 角色ID
            roleName: data?.roleName, // 角色名称
            roleCode: data?.roleCode, // 角色代码
            rootMenus: parsedRootMenus, // 权限菜单列表
          },
        });
        
        // 步骤5：跳转到首页
        navigate('/home');
      } else {
        // 登录失败：显示错误提示
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
      // 请求异常：显示错误提示
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
      // 无论成功或失败，都要重置加载状态
      setLoading(false);
    }
  };

  // ==================== 渲染组件 ====================
  return (
    <Flex minH="100vh" align="center" justify="center" bg={pageBg} px={4}>
      {/* 登录表单卡片 */}
      <Box as="form" onSubmit={handleLogin} bg={cardBg} p={10} borderRadius="lg" boxShadow={cardShadow} w="full" maxW="md">
        {/* 表单头部：标题和主题切换按钮 */}
        <Flex align="center" justify="space-between" mb={6}>
          <Heading size="lg">管理系统登录</Heading>
          {/* 主题切换按钮：允许用户在登录页就体验暗色/亮色切换 */}
          <IconButton
            aria-label="切换配色模式"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            colorScheme="teal"
          />
        </Flex>
        
        {/* 用户ID输入框 */}
        <FormControl id="userId" mb={4}>
          <FormLabel>用户ID</FormLabel>
          <Input
            placeholder="请输入用户ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </FormControl>
        
        {/* 密码输入框 */}
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
        
        {/* 登录按钮 */}
        <Button
          type="submit"
          colorScheme="teal"
          w="full"
          size="lg"
          isLoading={loading} // 加载状态显示转圈动画
          isDisabled={!isFormValid || loading} // 表单无效或正在加载时禁用
        >
          登录
        </Button>
      </Box>
    </Flex>
  );
};

export default LoginPage;
