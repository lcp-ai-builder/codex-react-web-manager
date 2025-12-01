import { useMemo } from 'react';
import { Button, ButtonGroup, Flex, Text, useColorModeValue } from '@chakra-ui/react';

const MAX_VISIBLE_PAGES = 10;

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, pageSize, size = 'sm', colorScheme = 'teal', showSummary = true, isLoading = false }) => {
  const summaryColor = useColorModeValue('gray.600', 'gray.400');

  // 根据当前页和总页数动态生成中间可点击的页码
  const pageNumbers = useMemo(() => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const innerSlots = MAX_VISIBLE_PAGES - 2;
    let start = currentPage - Math.floor(innerSlots / 2);
    let end = currentPage + Math.ceil(innerSlots / 2) - 1;

    if (start < 2) {
      start = 2;
      end = start + innerSlots - 1;
    }

    if (end > totalPages - 1) {
      end = totalPages - 1;
      start = end - innerSlots + 1;
    }

    const innerPages = Array.from({ length: end - start + 1 }, (_, index) => start + index);

    return [1, ...innerPages, totalPages];
  }, [currentPage, totalPages]);

  // 统一处理上下页以及具体页码的跳转
  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }
    onPageChange(nextPage);
  };

  return (
    <Flex align="center" justify="space-between" flexWrap="wrap" gap={4} w="100%">
      {/* 左侧可选的统计文案 */}
      {showSummary && (
        <Text color={summaryColor}>
          第 {currentPage} 页 / 共 {totalPages} 页
          {totalItems && pageSize ? ` · 每页 ${pageSize} 条 · 共 ${totalItems} 条` : ''}
          {isLoading ? ' · 正在加载...' : ''}
        </Text>
      )}
      {/* 上一页 / 下一页 */}
      <ButtonGroup size={size} variant="outline" colorScheme={colorScheme}>
        <Button onClick={() => handlePageChange(currentPage - 1)} isDisabled={currentPage === 1 || isLoading}>
          上一页
        </Button>
        <Button onClick={() => handlePageChange(currentPage + 1)} isDisabled={currentPage === totalPages || isLoading}>
          下一页
        </Button>
      </ButtonGroup>
      {/* 数字页码，点击可直接跳转 */}
      <ButtonGroup size={size} variant="outline" colorScheme={colorScheme}>
        {pageNumbers.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? 'solid' : 'outline'}
            onClick={() => handlePageChange(page)}
            isDisabled={isLoading}
          >
            {page}
          </Button>
        ))}
      </ButtonGroup>
    </Flex>
  );
};

export default Pagination;
