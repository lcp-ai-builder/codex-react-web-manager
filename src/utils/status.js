// 统一处理启用状态值，例如 isOpen: 1/0、"true"/"false"、"active"/"inactive"
export const getIsOpenFlag = (value) => {
  if (value === null || value === undefined) return 'unknown';
  const normalized = String(value).trim().toLowerCase();

  if (['active', 'enabled', 'open', '1', 'true', 'y', 'yes'].includes(normalized)) return 'open';
  if (['inactive', 'disabled', 'closed', '0', 'false', 'n', 'no'].includes(normalized)) return 'closed';

  return 'unknown';
};

export const isOpenEnabled = (value) => getIsOpenFlag(value) === 'open';
