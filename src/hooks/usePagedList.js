import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getTotalPages } from '@/utils/pagination.js';

// 通用的列表响应解析：优先从常见字段中抽取 list 和 total，失败时回落到本地数据
export const parseListResponse = (payload, fallbackList = []) => {
  const listCandidate = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data?.list)
    ? payload.data.list
    : Array.isArray(payload?.data?.records)
    ? payload.data.records
    : Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.list)
    ? payload.list
    : Array.isArray(payload?.records)
    ? payload.records
    : [];

  const list = listCandidate.length ? listCandidate : fallbackList;

  const total =
    typeof payload?.data?.total === 'number'
      ? payload.data.total
      : typeof payload?.data?.pagination?.total === 'number'
      ? payload.data.pagination.total
      : typeof payload?.total === 'number'
      ? payload.total
      : list.length;

  return { list, total };
};

const DEFAULT_TIMEOUT = 3000;

/**
 * 通用分页 Hook：负责管理列表数据、分页信息和基础加载状态
 *
 * @param {Object} options
 * @param {number} options.pageSize - 每页条数
 * @param {Array}  options.initialData - 本地兜底数据（接口不可用时回退）
 * @param {Function} options.fetchPage - 实际请求函数 ({ page, pageSize, signal }) => Promise<payload>
 * @param {Function} [options.onError] - 错误回调 (error, { page }) => void
 */
const usePagedList = ({ pageSize = 10, initialData = [], fetchPage, onError }) => {
  const [items, setItems] = useState(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(initialData.length);
  const [loading, setLoading] = useState(false);
  const fetchPageRef = useRef(fetchPage);
  const onErrorRef = useRef(onError);
  const itemsRef = useRef(initialData);
  const initialDataRef = useRef(initialData);

  useEffect(() => {
    fetchPageRef.current = fetchPage;
  }, [fetchPage]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  const totalPages = useMemo(() => getTotalPages(totalItems, pageSize), [totalItems, pageSize]);

  const loadPage = useCallback(
    async (page = 1, { timeout = DEFAULT_TIMEOUT } = {}) => {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = timeout ? setTimeout(() => controller.abort(), timeout) : null;

      try {
        const payload = await fetchPageRef.current({ page, pageSize, signal: controller.signal });
        const { list, total } = parseListResponse(payload, initialDataRef.current);
        setItems(list);
        setTotalItems(total);
        setCurrentPage(page);
        return { list, total };
      } catch (error) {
        if (onErrorRef.current) {
          onErrorRef.current(error, { page });
        }
        // 首次加载第一页失败时，自动退回到本地数据
        if (page === 1 && !itemsRef.current.length && initialDataRef.current.length) {
          setItems(initialDataRef.current);
          setTotalItems(initialDataRef.current.length);
          setCurrentPage(1);
        }
        throw error;
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        setLoading(false);
      }
    },
    [pageSize]
  );

  // 初次挂载时自动拉取第一页
  useEffect(() => {
    loadPage(1).catch(() => {
      // 错误已在 onError 中统一处理
    });
  }, [loadPage]);

  return {
    items,
    setItems,
    currentPage,
    setCurrentPage,
    totalItems,
    setTotalItems,
    totalPages,
    loading,
    loadPage,
  };
};

export default usePagedList;
