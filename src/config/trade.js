// 用于调用 csa（交易查询）服务的基础 URL，支持本地与线上配置
const normalizeBaseUrl = (url) => {
  if (!url) return '/api';
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

// 默认走本地代理 /api -> http://localhost:8181，可通过 VITE_CSA_API_BASE_URL 覆盖
export const TRADE_API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_CSA_API_BASE_URL || '/api');
