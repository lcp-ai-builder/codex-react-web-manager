import { Button, ButtonGroup, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { buildPageNumbers, clampPage } from '@/utils/pagination.js';

const MAX_VISIBLE_PAGES = 10;

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, pageSize, size = 'sm', colorScheme = 'teal', showSummary = true, isLoading = false }) => {
  const { t } = useTranslation();
  const summaryColor = useColorModeValue('gray.600', 'gray.400');

  const pageNumbers = buildPageNumbers(currentPage, totalPages, MAX_VISIBLE_PAGES);

  // 统一处理上下页以及具体页码的跳转
  const handlePageChange = (nextPage) => {
    const safePage = clampPage(nextPage, totalPages);
    if (safePage === currentPage) return;
    onPageChange(safePage);
  };

  const summaryText = (() => {
    if (!showSummary) return '';
    let text = t('pagination.pageSummary', { current: currentPage, total: totalPages });
    if (totalItems && pageSize) {
      text += t('pagination.withTotals', { pageSize, totalItems });
    }
    if (isLoading) {
      text += t('pagination.loading');
    }
    return text;
  })();

  return (
    <Flex align="center" justify="space-between" flexWrap="wrap" gap={4} w="100%">
      {/* 左侧可选的统计文案 */}
      {showSummary && (
        <Text color={summaryColor}>
          {summaryText}
        </Text>
      )}
      {/* 上一页 / 下一页 */}
      <ButtonGroup size={size} variant="outline" colorScheme={colorScheme}>
        <Button onClick={() => handlePageChange(currentPage - 1)} isDisabled={currentPage === 1 || isLoading}>
          {t('pagination.prev')}
        </Button>
        <Button onClick={() => handlePageChange(currentPage + 1)} isDisabled={currentPage === totalPages || isLoading}>
          {t('pagination.next')}
        </Button>
      </ButtonGroup>
      {/* 数字页码，点击可直接跳转 */}
      <ButtonGroup size={size} variant="outline" colorScheme={colorScheme}>
        {pageNumbers.map((page) => (
          <Button key={page} variant={page === currentPage ? 'solid' : 'outline'} onClick={() => handlePageChange(page)} isDisabled={isLoading}>
            {page}
          </Button>
        ))}
      </ButtonGroup>
    </Flex>
  );
};

export default Pagination;
