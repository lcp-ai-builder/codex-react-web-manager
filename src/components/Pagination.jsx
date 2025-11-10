import {
  Button,
  ButtonGroup,
  Flex,
  Text,
  useColorModeValue
} from '@chakra-ui/react';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  size = 'sm',
  colorScheme = 'teal',
  showSummary = true
}) => {
  const summaryColor = useColorModeValue('gray.600', 'gray.400');

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }
    onPageChange(nextPage);
  };

  return (
    <Flex
      align="center"
      justify="space-between"
      flexWrap="wrap"
      gap={4}
      w="100%"
    >
      {showSummary && (
        <Text color={summaryColor}>
          第 {currentPage} 页 / 共 {totalPages} 页
          {totalItems && pageSize
            ? ` · 每页 ${pageSize} 条 · 共 ${totalItems} 条`
            : ''}
        </Text>
      )}
      <ButtonGroup size={size} variant="outline" colorScheme={colorScheme}>
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          isDisabled={currentPage === 1}
        >
          上一页
        </Button>
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          isDisabled={currentPage === totalPages}
        >
          下一页
        </Button>
      </ButtonGroup>
    </Flex>
  );
};

export default Pagination;
