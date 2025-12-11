import { TRADE_API_BASE_URL } from '@/config/api.js';

const DEFAULT_PAGE_SIZE = 10;

const normalizeTradesResponse = (data, fallbackSize) => {
  const records = Array.isArray(data?.trades)
    ? data.trades
    : Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.content)
          ? data.content
          : [];
  const total =
    Number(data?.total) ||
    Number(data?.totalElements) ||
    Number(data?.totalCount) ||
    Number(data?.count) ||
    records.length ||
    0;
  const sizeFromResponse = Number(data?.size) || fallbackSize || DEFAULT_PAGE_SIZE;
  const totalPages = Math.max(1, data?.totalPages || Math.ceil(total / sizeFromResponse) || 1);
  return {
    records,
    total,
    totalPages,
    pageSize: sizeFromResponse,
  };
};

export const getTrades = async ({ page = 1, size = DEFAULT_PAGE_SIZE, filters = {} } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (filters.notesKeyword) params.append('notesKeyword', filters.notesKeyword);
  if (filters.tradeId) params.append('tradeId', filters.tradeId);
  if (filters.userId) params.append('userId', filters.userId);

  const response = await fetch(`${TRADE_API_BASE_URL}/es/trades?${params.toString()}`);
  if (!response.ok) {
    const message = `请求失败：${response.status}`;
    throw new Error(message);
  }
  const data = await response.json();
  return normalizeTradesResponse(data, size);
};

// 查询最近一小时（或最近有数据的一小时）交易汇总
export const fetchRecentHourTradeSummary = async ({ signal } = {}) => {
  const response = await fetch(`${TRADE_API_BASE_URL}/es/trades/summary/recent-hour`, { signal });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(payload?.message || '获取交易汇总失败');
    error.payload = payload;
    throw error;
  }
  return payload;
};

const resolveWsBase = () => {
  if (import.meta.env.VITE_WS_BASE) return import.meta.env.VITE_WS_BASE;
  const protocol = window?.location?.protocol || 'http:';
  const host = window?.location?.hostname || 'localhost';
  return `${protocol}//${host}:8181`;
};

// 建立交易汇总推送的 WebSocket 连接
export const createTradeSummarySocket = ({ onOpen, onError, onMessage } = {}) => {
  const wsBase = resolveWsBase();
  const socket = new WebSocket(`${wsBase}/ws/trade-summary`);
  socket.onopen = () => {
    if (onOpen) onOpen();
  };
  socket.onerror = () => {
    if (onError) onError(new Error('WebSocket 连接失败'));
  };
  socket.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      if (onMessage) onMessage(payload);
    } catch (err) {
      if (onError) onError(new Error('解析推送数据失败'));
    }
  };
  return socket;
};
