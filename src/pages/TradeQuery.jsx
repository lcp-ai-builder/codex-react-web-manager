import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Text,
} from '@chakra-ui/react';

const TradeQueryPage = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const zebra = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('blue.600', 'blue.100');
  const headerHover = useColorModeValue('blue.50', 'blue.900');
  const [sortOrder, setSortOrder] = useState(null);
  const [tradeIdQuery, setTradeIdQuery] = useState('');
  const [userIdQuery, setUserIdQuery] = useState('');
  const [notesKeyword, setNotesKeyword] = useState('人工智能');
  const [detailTarget, setDetailTarget] = useState(null);
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();

  const [filters, setFilters] = useState({ tradeId: '', userId: '', notesKeyword: '人工智能' });
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageInput, setPageInput] = useState('1');

  const handlePageChange = useCallback(
    (nextPage) => {
      const safePage = Math.min(Math.max(nextPage, 1), totalPages || 1);
      setPage(safePage);
    },
    [totalPages]
  );

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: String(pageSize),
      });
      if (filters.notesKeyword) params.append('notesKeyword', filters.notesKeyword);
      if (filters.tradeId) params.append('tradeId', filters.tradeId);
      if (filters.userId) params.append('userId', filters.userId);
      const response = await fetch(`http://192.168.127.128:8181/es/trades?${params.toString()}`);
      if (!response.ok) throw new Error(`请求失败：${response.status}`);
      const result = await response.json();
      const payload = Array.isArray(result?.trades) ? result.trades : Array.isArray(result) ? result : result?.data || result?.content || [];
      setTrades(Array.isArray(payload) ? payload : []);
      const total = Number(result?.total) || result?.totalElements || result?.totalCount || result?.count || (Array.isArray(payload) ? payload.length : 0);
      const sizeFromResponse = Number(result?.size) || pageSize;
      setTotalCount(total);
      setTotalPages(Math.max(1, result?.totalPages || Math.ceil(total / sizeFromResponse) || 1));
    } catch (err) {
      setError(err.message || '查询失败');
      setTrades([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  const sortedOrders = useMemo(() => {
    if (!sortOrder) return trades;
    const factor = sortOrder === 'asc' ? 1 : -1;
    return [...trades].sort((a, b) => {
      const aTime = new Date(a.executedAt || a.createdAt).getTime();
      const bTime = new Date(b.executedAt || b.createdAt).getTime();
      return (aTime - bTime) * factor;
    });
  }, [sortOrder, trades]);

  const visibleRows = useMemo(() => {
    if (loading) return [];
    const limited = sortedOrders.slice(0, pageSize);
    const blanks = Math.max(pageSize - limited.length, 0);
    return [...limited, ...Array(blanks).fill(null)];
  }, [loading, pageSize, sortedOrders]);

  const pageNumbers = useMemo(() => {
    const windowSize = 5;
    if (!totalPages) return [];
    let start = Math.max(1, page - Math.floor(windowSize / 2));
    let end = Math.min(totalPages, start + windowSize - 1);
    if (end - start + 1 < windowSize) {
      start = Math.max(1, end - windowSize + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [page, totalPages]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);


  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString();
  };

  return (
    <Box bg={cardBg} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor={borderColor} p={6} color={textColor}>
      <Flex justify="space-between" align="flex-end" mb={4} gap={3} flexWrap="nowrap">
        <Flex gap={3} align="center" flexWrap="nowrap">
          <FormControl minW="260px" display="flex" alignItems="center" gap={2}>
            <FormLabel mb={0} whiteSpace="nowrap">
              交易编号
            </FormLabel>
            <Input size="sm" placeholder="输入交易编号" value={tradeIdQuery} onChange={(event) => setTradeIdQuery(event.target.value)} />
          </FormControl>
          <FormControl minW="260px" display="flex" alignItems="center" gap={2}>
            <FormLabel mb={0} whiteSpace="nowrap">
              交易人ID
            </FormLabel>
            <Input size="sm" placeholder="输入交易人ID" value={userIdQuery} onChange={(event) => setUserIdQuery(event.target.value)} />
          </FormControl>
          <FormControl minW="260px" display="flex" alignItems="center" gap={2}>
            <FormLabel mb={0} whiteSpace="nowrap">
              备注关键词
            </FormLabel>
            <Input size="sm" placeholder="输入备注关键词" value={notesKeyword} onChange={(event) => setNotesKeyword(event.target.value)} />
          </FormControl>
          <FormControl minW="260px" display="flex" alignItems="center" gap={2}>
            <Button
              size="sm"
              colorScheme="teal"
              onClick={() => {
                setPage(1);
                setFilters({
                  tradeId: tradeIdQuery.trim(),
                  userId: userIdQuery.trim(),
                  notesKeyword: notesKeyword.trim(),
                });
              }}
            >
              查询
            </Button>
          </FormControl>
        </Flex>

        <Button size="sm" variant="ghost" onClick={() => setSortOrder(null)}>
          恢复默认排序
        </Button>
      </Flex>
      {error && (
        <Box mb={3} color="red.400">
          {error}
        </Box>
      )}
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>交易编号</Th>
              <Th>交易人ID</Th>
              <Th cursor="pointer" onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))} _hover={{ bg: headerHover }}>
                成交时间 {sortOrder ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading && (
              <Tr>
                <Td colSpan={3}>查询中...</Td>
              </Tr>
            )}
            {!loading &&
              visibleRows.map((trade, index) => {
                if (!trade) {
                  return (
                    <Tr key={`placeholder-${index}`} bg={index % 2 === 1 ? zebra : 'transparent'}>
                      <Td>&nbsp;</Td>
                      <Td>&nbsp;</Td>
                      <Td>&nbsp;</Td>
                    </Tr>
                  );
                }
                return (
                  <Tr key={trade.tradeId || trade.id || index} bg={index % 2 === 1 ? zebra : 'transparent'}>
                    <Td
                      color="teal.500"
                      cursor="pointer"
                      onClick={() => {
                        setDetailTarget(trade);
                        onDetailOpen();
                      }}
                    >
                      <Tooltip label="查看完整交易信息" hasArrow>
                        <Text>{trade.tradeId || trade.id || '-'}</Text>
                      </Tooltip>
                    </Td>
                    <Td>{trade.userId || '-'}</Td>
                    <Td>{formatTime(trade.executedAt || trade.createdAt)}</Td>
                  </Tr>
                );
              })}
          </Tbody>
        </Table>
      </TableContainer>
      <Flex mt={4} align="center" justify="space-between" gap={3} flexWrap="wrap">
        <Flex align="center" gap={2}>
          <Text>每页</Text>
          <Select
            size="sm"
            w="80px"
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
          >
            {[5, 10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
          <Text>条 · 共 {totalCount} 条</Text>
        </Flex>
        <Flex align="center" gap={2} flexWrap="wrap">
          <Button size="sm" onClick={() => handlePageChange(1)} isDisabled={page <= 1}>
            首页
          </Button>
          <Button size="sm" onClick={() => handlePageChange(page - 1)} isDisabled={page <= 1}>
            上一页
          </Button>
          <Text>
            第 {page} / {totalPages} 页
          </Text>
          <Flex align="center" gap={1}>
            {pageNumbers.map((num) => (
              <Button key={num} size="sm" variant={num === page ? 'solid' : 'outline'} colorScheme="teal" onClick={() => handlePageChange(num)}>
                {num}
              </Button>
            ))}
          </Flex>
          <Button size="sm" onClick={() => handlePageChange(page + 1)} isDisabled={page >= totalPages}>
            下一页
          </Button>
          <Button size="sm" onClick={() => handlePageChange(totalPages)} isDisabled={page >= totalPages}>
            末页
          </Button>
          <Flex align="center" gap={2}>
            <Text>跳转到</Text>
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
                  if (!Number.isNaN(target)) handlePageChange(target);
                }
              }}
            />
            <Text>页</Text>
          </Flex>
        </Flex>
      </Flex>

      <Modal isOpen={isDetailOpen} onClose={onDetailClose} isCentered size="xl">
        <ModalOverlay />
        <ModalContent maxW="720px">
          <ModalHeader>交易详情</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {detailTarget ? (
              <Box display="grid" gridTemplateColumns="120px 1fr" rowGap={2} columnGap={3} color={textColor}>
                <Text fontWeight="semibold">交易编号</Text>
                <Text>{detailTarget.tradeId || detailTarget.id || '-'}</Text>
                <Text fontWeight="semibold">交易人ID</Text>
                <Text>{detailTarget.userId || '-'}</Text>
                <Text fontWeight="semibold">交易方向</Text>
                <Text>{detailTarget.side || '-'}</Text>
                <Text fontWeight="semibold">交易币种</Text>
                <Text>{detailTarget.symbol || '-'}</Text>
                <Text fontWeight="semibold">价格</Text>
                <Text>{detailTarget.price ?? '-'}</Text>
                <Text fontWeight="semibold">数量</Text>
                <Text>{detailTarget.quantity ?? '-'}</Text>
                <Text fontWeight="semibold">成交时间</Text>
                <Text>{formatTime(detailTarget.executedAt || detailTarget.createdAt)}</Text>
                <Text fontWeight="semibold">手续费</Text>
                <Text>
                  {detailTarget.fee ?? '-'} {detailTarget.feeAsset || ''}
                </Text>
                <Text fontWeight="semibold">订单类型</Text>
                <Text>{detailTarget.orderType || '-'}</Text>
                <Text fontWeight="semibold">订单状态</Text>
                <Text>{detailTarget.status || '-'}</Text>
                <Text fontWeight="semibold">杠杆</Text>
                <Text>{detailTarget.leverage ?? '-'}</Text>
                <Text fontWeight="semibold">备注</Text>
                <Text>{detailTarget.notes || '-'}</Text>
                <Text fontWeight="semibold">交易所</Text>
                <Text>{detailTarget.exchange || '-'}</Text>
                <Text fontWeight="semibold">订单ID</Text>
                <Text>{detailTarget.orderId || '-'}</Text>
                <Text fontWeight="semibold">交易哈希</Text>
                <Text>{detailTarget.transactionHash || '-'}</Text>
                <Text fontWeight="semibold">钱包地址</Text>
                <Text>{detailTarget.walletAddress || '-'}</Text>
                <Text fontWeight="semibold">标签</Text>
                <Text>{detailTarget.tag || '-'}</Text>
                <Text fontWeight="semibold">创建者</Text>
                <Text>{detailTarget.createdBy || '-'}</Text>
              </Box>
            ) : (
              <Text color={textColor}>暂无交易信息</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onDetailClose}>关闭</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TradeQueryPage;
