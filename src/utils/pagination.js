// 通用分页工具：统一计算总页数、可见页码和页码边界
export const getTotalPages = (totalItems = 0, pageSize = 10) => {
  const size = Number(pageSize) > 0 ? Number(pageSize) : 1;
  return Math.max(1, Math.ceil(Number(totalItems) / size));
};

export const clampPage = (page = 1, totalPages = 1) => {
  const total = Math.max(1, Number(totalPages) || 1);
  const nextPage = Number(page) || 1;
  if (nextPage < 1) return 1;
  if (nextPage > total) return total;
  return nextPage;
};

export const buildPageNumbers = (currentPage = 1, totalPages = 1, maxVisible = 10) => {
  const total = Math.max(1, Number(totalPages) || 1);
  const max = Math.max(3, Number(maxVisible) || 3); // 至少首尾+一个中间页
  const current = clampPage(currentPage, total);

  if (total <= max) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const innerSlots = max - 2;
  let start = current - Math.floor(innerSlots / 2);
  let end = current + Math.ceil(innerSlots / 2) - 1;

  if (start < 2) {
    start = 2;
    end = start + innerSlots - 1;
  }

  if (end > total - 1) {
    end = total - 1;
    start = end - innerSlots + 1;
  }

  const innerPages = Array.from({ length: end - start + 1 }, (_, index) => start + index);

  return [1, ...innerPages, total];
};
