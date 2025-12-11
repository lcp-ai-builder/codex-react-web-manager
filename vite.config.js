import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  // 让构建产物可以挂载在 /trade-manager 子路径下
  base: '/trade-manager/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    global: 'window',
  },
  server: {
    port: 5173,
    // host: '192.168.127.128',
    host: true,
    open: false,
    strictPort: true,
    origin: 'http://192.168.127.128:5173',
    // 如果需要固定 HMR 连接，可取消注释下方配置
    // hmr: {
    //   host: '192.168.127.128',
    //   protocol: 'ws',
    //   port: 5173,
    //   clientPort: 5173
    // },
    proxy: {
      '/manager': {
        target: 'http://192.168.127.128:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/manager/, ''),
      },
      '/api': {
        target: 'http://192.168.127.128:8181',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/ws': {
        target: 'http://192.168.127.128:8181',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
