const devBase = 'http://localhost:3000';
const defaultBaseMap = {
  development: devBase,
  production: 'http://lcpstd.com',
};

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  defaultBaseMap[import.meta.env.MODE] ??
  devBase;
