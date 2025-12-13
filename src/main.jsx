import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from '@/App.jsx';
import useAuthStore from '@/store/useAuthStore.js';
import '@/i18n/index.js';
import sourceHanSans from '@/assets/fonts/SourceHanSansSC-Normal.otf';

// 全局主题：配置初始配色方案，后续 Chakra 组件都会遵守
const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
  fonts: {
    heading: 'SourceHanSansSC, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    body: 'SourceHanSansSC, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  styles: {
    global: {
      '@font-face': [
        {
          fontFamily: 'SourceHanSansSC',
          src: `url(${sourceHanSans}) format('opentype')`,
          fontWeight: 'normal',
          fontStyle: 'normal',
          fontDisplay: 'swap',
        },
      ],
    },
  },
});

// React18 新的渲染方式，包裹 Chakra Provider 和路由
const routerBase = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

// 根路径重定向组件：根据认证状态决定跳转到登录页还是首页
// 使用组件而非立即执行函数，避免每次渲染都重新执行
const RootRedirect = () => {
  const { token, currentUser } = useAuthStore.getState();
  if (token && currentUser) {
    return <Navigate to="/home" replace />;
  }
  return <Navigate to="/login" replace />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      {/* ColorModeScript 让颜色模式在首次渲染时就正确 */}
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      {/* BrowserRouter 负责监听 URL 并渲染 <App /> 中定义的路由 */}
      <BrowserRouter basename={routerBase}>
        <Routes>
          <Route
            path="/"
            element={<RootRedirect />}
          />
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);
