const defaultBaseMap = {
  development: 'http://abc123.com',
  production: 'http://lcpstd.com'
};

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  defaultBaseMap[import.meta.env.MODE] ??
  'http://abc123.com';
