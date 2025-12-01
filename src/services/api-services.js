import { API_BASE_URL } from '@/config/api.js';
import useAuthStore from '@/store/useAuthStore.js';

// 统一的请求封装：返回 JSON，异常由调用方处理
const request = async (path, options = {}) => {
  const { token } = useAuthStore.getState();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error('Request failed');
    error.payload = payload;
    throw error;
  }
  return payload;
};

// 登录
export const login = async ({ userId, password }) =>
  request('/login', {
    method: 'POST',
    body: JSON.stringify({ userId, password }),
  });

// 用户列表
export const fetchUsers = async ({ page, pageSize, signal }) =>
  request(`/getAll?page=${page}&pageSize=${pageSize}`, { signal });

export const addUser = async ({ data, signal }) =>
  request('/addNewUser', {
    method: 'POST',
    body: JSON.stringify(data),
    signal,
  });

export const updateUser = async ({ id, data, signal }) =>
  request('/editUserInfo', {
    method: 'POST',
    body: JSON.stringify({ id, ...data }),
    signal,
  });

export const deleteUser = async ({ id, signal }) =>
  request('/deleteUserInfo', {
    method: 'POST',
    body: JSON.stringify({ id }),
    signal,
  });

// 操作员
export const fetchOperators = async ({ page, pageSize, signal }) =>
  request(`/operators?page=${page}&pageSize=${pageSize}`, { signal });

export const createOperator = async ({ data, signal }) =>
  request('/operators', {
    method: 'POST',
    body: JSON.stringify(data),
    signal,
  });

export const updateOperator = async ({ id, data, signal }) =>
  request(`/operators/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    signal,
  });

export const updateOperatorIsOpen = async ({ id, isOpen, signal }) =>
  request(`/operators/${encodeURIComponent(id)}/is-open?isOpen=${encodeURIComponent(isOpen)}`, {
    method: 'PUT',
    signal,
  });

// 角色
export const fetchRoles = async ({ page, pageSize, signal }) =>
  request(`/roles?page=${page}&pageSize=${pageSize}`, { signal });

export const createRole = async ({ data, signal }) =>
  request('/roles', {
    method: 'POST',
    body: JSON.stringify(data),
    signal,
  });

export const updateRole = async ({ id, data, signal }) =>
  request(`/roles/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    signal,
  });

export const updateRoleIsOpen = async ({ id, isOpen, signal }) =>
  request(`/roles/${encodeURIComponent(id)}/is-open?isOpen=${encodeURIComponent(isOpen)}`, {
    method: 'PUT',
    signal,
  });
