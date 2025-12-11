import { Box, Button, Flex, FormControl, FormLabel, Input, Select, Text, useColorModeValue } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * A reusable layout that combines a search filter row, a table area, and an optional overlay + pagination footer.
 * - `filters`: array of { key, label, render, minW } where render returns an input/select node.
 * - `onSearch`: handler for the search button; button shows when provided.
 * - `searchLabel`: text for the search button.
 * - `extraActions`: optional node rendered on the right side of the filters row.
 * - `table`: node representing the table (including container).
 * - `overlay`: optional node positioned above the table area (e.g., loading mask).
 * - `pagination`: node rendered below the table. If not provided, component can render built-in pagination via `paginationConfig`.
 * - `error`: optional error message node.
 * - `cardProps`: additional props forwarded to the outer card container.
 * - `paginationConfig`: optional { page, totalPages, totalCount, pageSize, pageSizeOptions, onPageChange, onPageSizeChange, isLoading, pageWindowSize } to use built-in pagination UI.
 */
const BigDataSearchTableLayout = ({ filters = [], onSearch, searchLabel, extraActions, table, overlay, pagination, paginationConfig, error, cardProps = {} }) => {
  const { t } = useTranslation();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textMuted = useColorModeValue('gray.600', 'gray.400');
  const [pageInput, setPageInput] = useState(String(paginationConfig?.page ?? 1));
  const pageWindowSize = paginationConfig?.pageWindowSize ?? 5;
  const searchText = searchLabel ?? t('action.search');

  useEffect(() => {
    if (paginationConfig?.page) {
      setPageInput(String(paginationConfig.page));
    }
  }, [paginationConfig?.page]);

  const computedPageNumbers = useMemo(() => {
    if (!paginationConfig) return [];
    const { page = 1, totalPages = 1 } = paginationConfig;
    if (!totalPages) return [];
    let start = Math.max(1, page - Math.floor(pageWindowSize / 2));
    let end = Math.min(totalPages, start + pageWindowSize - 1);
    if (end - start + 1 < pageWindowSize) {
      start = Math.max(1, end - pageWindowSize + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
  }, [pageWindowSize, paginationConfig]);

  const renderPagination = () => {
    if (pagination) return pagination;
    if (!paginationConfig) return null;
    const { page = 1, totalPages = 1, totalCount = 0, pageSize = 10, pageSizeOptions = [5, 10, 20, 50, 100], onPageChange, onPageSizeChange, isLoading } = paginationConfig;
    return (
      <Flex align="center" justify="space-between" gap={3} flexWrap="wrap">
        <Flex align="center" gap={2}>
          <Text>{t('pagination.perPage')}</Text>
          <Select
            size="sm"
            w="80px"
            value={pageSize}
            onChange={(event) => {
              const nextSize = Number(event.target.value);
              onPageSizeChange?.(nextSize);
              onPageChange?.(1);
            }}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
          <Text>{t('pagination.totalItems', { total: totalCount })}</Text>
        </Flex>
        <Flex align="center" gap={2} flexWrap="wrap">
          <Button size="sm" onClick={() => onPageChange?.(1)} isDisabled={page <= 1 || isLoading}>
            {t('pagination.first')}
          </Button>
          <Button size="sm" onClick={() => onPageChange?.(page - 1)} isDisabled={page <= 1 || isLoading}>
            {t('pagination.prev')}
          </Button>
          <Text color={textMuted}>
            {t('pagination.pageXofY', { current: page, total: totalPages })}
          </Text>
          <Flex align="center" gap={1}>
            {computedPageNumbers.map((num) => (
              <Button key={num} size="sm" variant={num === page ? 'solid' : 'outline'} colorScheme="teal" onClick={() => onPageChange?.(num)} isDisabled={isLoading}>
                {num}
              </Button>
            ))}
          </Flex>
          <Button size="sm" onClick={() => onPageChange?.(page + 1)} isDisabled={page >= totalPages || isLoading}>
            {t('pagination.next')}
          </Button>
          <Button size="sm" onClick={() => onPageChange?.(totalPages)} isDisabled={page >= totalPages || isLoading}>
            {t('pagination.last')}
          </Button>
          <Flex align="center" gap={2}>
            <Text>{t('pagination.jumpTo')}</Text>
            <Input
              size="sm"
              w="80px"
              type="number"
              min={1}
              value={pageInput}
              onChange={(event) => setPageInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  const target = Number(event.target.value);
                  if (!Number.isNaN(target)) onPageChange?.(target);
                }
              }}
            />
            <Text>{t('pagination.pageUnit')}</Text>
          </Flex>
        </Flex>
      </Flex>
    );
  };

  return (
    <Box bg={cardBg} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor={borderColor} p={6} {...cardProps}>
      <Flex justify="space-between" align="flex-end" mb={4} gap={3} flexWrap="nowrap">
        <Flex gap={3} align="center" flexWrap="nowrap" overflowX="auto" minW={0}>
          {filters.map((filter) => (
            <FormControl key={filter.key} minW={filter.minW || '240px'} display="flex" alignItems="center" gap={2}>
              {filter.label ? (
                <FormLabel mb={0} whiteSpace="nowrap">
                  {filter.label}
                </FormLabel>
              ) : null}
              {typeof filter.render === 'function' ? filter.render() : null}
            </FormControl>
          ))}
          {onSearch ? (
            <FormControl minW="160px" display="flex" alignItems="center" gap={2}>
              <Button size="sm" colorScheme="teal" onClick={onSearch}>
                {searchText}
              </Button>
            </FormControl>
          ) : null}
        </Flex>
        {extraActions}
      </Flex>

      {error ? (
        <Box mb={3} color="red.400">
          {error}
        </Box>
      ) : null}

      <Box position="relative">
        {table}
        {overlay}
      </Box>

      {renderPagination() ? <Box mt={4}>{renderPagination()}</Box> : null}
    </Box>
  );
};

export default BigDataSearchTableLayout;
