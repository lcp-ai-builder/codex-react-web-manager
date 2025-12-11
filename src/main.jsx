import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from '@/App.jsx';
import useAuthStore from '@/store/useAuthStore.js';

// 全局主题：配置初始配色方案，后续 Chakra 组件都会遵守
const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
});

// React18 新的渲染方式，包裹 Chakra Provider 和路由
const routerBase = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

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
            element={(() => {
              const { token, currentUser } = useAuthStore.getState();
              if (token && currentUser) {
                return <Navigate to="/home" replace />;
              }
              return <Navigate to="/login" replace />;
            })()}
          />
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);
