import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    // host: '192.168.127.128',
    host: true,
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
      '/api': {
        target: 'http://192.168.127.128:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
