// 统一处理各种形式的状态值，例如 "active" / "ACTIVE" / 1 / "1" / true
export const getStatusFlag = (value) => {
  if (value === null || value === undefined) return 'unknown';
  const normalized = String(value).trim().toLowerCase();

  if (['active', 'enabled', '1', 'true', 'y', 'yes'].includes(normalized)) return 'active';
  if (['inactive', 'disabled', '0', 'false', 'n', 'no'].includes(normalized)) return 'inactive';

  return 'unknown';
};

export const isStatusActive = (value) => getStatusFlag(value) === 'active';

export const isStatusInactive = (value) => getStatusFlag(value) === 'inactive';
