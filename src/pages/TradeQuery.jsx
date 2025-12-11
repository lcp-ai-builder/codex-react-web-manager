import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Input,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Spinner,
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
import SearchTableLayout from '@/components/SearchTableLayout.jsx';

const TradeQueryPage = () => {
  const zebra = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('blue.600', 'blue.100');
  const headerHover = useColorModeValue('blue.50', 'blue.900');
  const overlayBg = useColorModeValue('whiteAlpha.800', 'blackAlpha.600');
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
    const limited = sortedOrders.slice(0, pageSize);
    const blanks = Math.max(pageSize - limited.length, 0);
    return [...limited, ...Array(blanks).fill(null)];
  }, [pageSize, sortedOrders]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

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

  const filterItems = useMemo(
    () => [
      {
        key: 'tradeId',
        label: '交易编号',
        render: () => <Input size="sm" placeholder="输入交易编号" value={tradeIdQuery} onChange={(event) => setTradeIdQuery(event.target.value)} />,
        minW: '260px',
      },
      {
        key: 'userId',
        label: '交易人ID',
        render: () => <Input size="sm" placeholder="输入交易人ID" value={userIdQuery} onChange={(event) => setUserIdQuery(event.target.value)} />,
        minW: '260px',
      },
      {
        key: 'notesKeyword',
        label: '备注关键词',
        render: () => <Input size="sm" placeholder="输入备注关键词" value={notesKeyword} onChange={(event) => setNotesKeyword(event.target.value)} />,
        minW: '260px',
      },
    ],
    [notesKeyword, tradeIdQuery, userIdQuery]
  );

  const handleSearch = useCallback(() => {
    setPage(1);
    setFilters({
      tradeId: tradeIdQuery.trim(),
      userId: userIdQuery.trim(),
      notesKeyword: notesKeyword.trim(),
    });
  }, [notesKeyword, tradeIdQuery, userIdQuery]);

  const tableContent = (
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
          {visibleRows.map((trade, index) => {
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
  );

  return (
    <>
      <SearchTableLayout
        filters={filterItems}
        onSearch={handleSearch}
        searchLabel="查询"
        extraActions={
          <Button size="sm" variant="ghost" onClick={() => setSortOrder(null)}>
            恢复默认排序
          </Button>
        }
        table={tableContent}
        paginationConfig={{
          page,
          totalPages,
          totalCount,
          pageSize,
          pageSizeOptions: [5, 10, 20, 50, 100],
          onPageChange: handlePageChange,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
          isLoading: loading,
        }}
        overlay={
          loading ? (
            <Flex position="absolute" inset={0} align="center" justify="center" bg={overlayBg} pointerEvents="none">
              <Spinner size="lg" color="teal.400" thickness="3px" />
            </Flex>
          ) : null
        }
        error={error}
        cardProps={{ color: textColor }}
      />

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
    </>
  );
};

export default TradeQueryPage;
