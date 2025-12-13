# 多环境开发配置说明

## 概述

项目支持在 Mac 虚拟机（mac-vm）和 WSL 两种不同的开发环境中运行，每个环境使用不同的后端服务代理地址。

## 环境配置

### Mac 虚拟机环境（mac-vm）
- 管理后台服务：`http://192.168.127.128:8080`
- API 服务：`http://192.168.127.128:8181`

### WSL 环境（wsl）
- 管理后台服务：`http://localhost:8080`
- API 服务：`http://localhost:8181`

## 使用方法

### 方式一：使用 npm 脚本（推荐）

```bash
# Mac 虚拟机环境
npm run dev:mac-vm

# WSL 环境
npm run dev:wsl

# 默认环境（WSL）
npm run dev
```

### 方式二：使用命令行参数

```bash
# Mac 虚拟机环境
npm run dev -- --mac-vm
# 或
vite --mac-vm

# WSL 环境
npm run dev -- --wsl
# 或
vite --wsl
```

### 方式三：使用环境变量

```bash
# Mac 虚拟机环境
VITE_ENV=mac-vm npm run dev

# WSL 环境
VITE_ENV=wsl npm run dev
```

## 配置修改

如需修改环境配置，请编辑 `vite.config.js` 文件中的 `ENV_CONFIGS` 对象：

```javascript
const ENV_CONFIGS = {
  'mac-vm': {
    manager: {
      target: 'http://192.168.127.128:8080',  // 修改这里
    },
    api: {
      target: 'http://192.168.127.128:8181',  // 修改这里
    },
  },
  wsl: {
    manager: {
      target: 'http://localhost:8080',  // 修改这里
    },
    api: {
      target: 'http://localhost:8181',  // 修改这里
    },
  },
};
```

## 启动时显示的信息

启动开发服务器时，会在控制台显示当前使用的环境配置：

```
🚀 当前开发环境: MAC-VM
📡 管理后台代理: http://192.168.127.128:8080
📡 API 服务代理: http://192.168.127.128:8181
```

这样可以快速确认当前使用的环境配置是否正确。

