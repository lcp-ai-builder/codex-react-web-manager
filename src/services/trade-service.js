import { TRADE_API_BASE_URL } from '@/config/trade.js';

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
