/**
 * Vite 配置文件
 * 
 * 支持多环境开发配置：
 * - mac-vm: Mac 虚拟机环境
 * - wsl: WSL 环境
 * 
 * 使用方式：
 * - npm run dev:mac-vm  # Mac 虚拟机环境
 * - npm run dev:wsl     # WSL 环境
 * - npm run dev         # 默认环境（可通过 VITE_ENV 环境变量指定）
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// 开发环境配置映射
// 根据 VITE_ENV 环境变量或命令行参数选择不同的代理配置
const ENV_CONFIGS = {
  'mac-vm': {
    // Mac 虚拟机环境配置
    manager: {
      target: 'http://192.168.127.128:8080',
      description: 'Mac VM - 管理后台服务',
    },
    api: {
      target: 'http://192.168.127.128:8181',
      description: 'Mac VM - API 服务',
    },
  },
  wsl: {
    // WSL 环境配置
    manager: {
      target: 'http://localhost:8080',
      description: 'WSL - 管理后台服务',
    },
    api: {
      target: 'http://localhost:8181',
      description: 'WSL - API 服务',
    },
  },
};

/**
 * 获取当前开发环境
 * 优先级：命令行参数 > 环境变量 > 默认值（wsl）
 * 
 * 支持方式：
 * 1. 命令行参数：vite --env=mac-vm 或 vite --env=wsl
 * 2. 环境变量：VITE_ENV=mac-vm vite 或 VITE_ENV=wsl vite
 * 3. 默认值：wsl
 */
function getCurrentEnv() {
  // 从命令行参数获取（例如：--env=mac-vm 或 --mac-vm）
  const args = process.argv;
  
  // 方式1：--env=mac-vm
  const envArg = args.find((arg) => arg.startsWith('--env='));
  if (envArg) {
    const env = envArg.split('=')[1];
    if (ENV_CONFIGS[env]) {
      return env;
    }
  }
  
  // 方式2：--mac-vm 或 --wsl（简化写法）
  if (args.includes('--mac-vm')) {
    return 'mac-vm';
  }
  if (args.includes('--wsl')) {
    return 'wsl';
  }

  // 从环境变量获取
  const envFromVar = process.env.VITE_ENV;
  if (envFromVar && ENV_CONFIGS[envFromVar]) {
    return envFromVar;
  }

  // 默认使用 wsl 环境
  return 'wsl';
}

// 获取当前环境配置
const currentEnv = getCurrentEnv();
const envConfig = ENV_CONFIGS[currentEnv];

console.log(`\n🚀 当前开发环境: ${currentEnv.toUpperCase()}`);
console.log(`📡 管理后台代理: ${envConfig.manager.target}`);
console.log(`📡 API 服务代理: ${envConfig.api.target}\n`);

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
    host: true,
    open: false,
    strictPort: true,
    // 根据环境动态配置代理
    proxy: {
      '/manager': {
        target: envConfig.manager.target,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/manager/, ''),
      },
      '/api': {
        target: envConfig.api.target,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/ws': {
        target: envConfig.api.target,
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
