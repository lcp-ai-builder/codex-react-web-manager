const normalizeBaseUrl = (url) => {
  if (!url) return '/api';
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL || '/api'
);
