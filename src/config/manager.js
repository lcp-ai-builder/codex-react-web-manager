// 兼容本地与线上环境，统一 API 基础地址
const normalizeBaseUrl = (url) => {
  if (!url) return '/manager';
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_CSM_API_BASE_URL || '/manager');
