import { TRADE_API_BASE_URL } from '@/config/api.js';

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
