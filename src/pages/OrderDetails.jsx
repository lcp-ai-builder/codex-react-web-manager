import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Tooltip,
  IconButton,
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
import { FiSearch } from 'react-icons/fi';
import { orderDetailsData } from '@/data/orderDetails.js';

const OrderDetailsPage = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const zebra = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('blue.600', 'blue.100');
  const headerHover = useColorModeValue('blue.50', 'blue.900');
  const [sortOrder, setSortOrder] = useState(null);
  const [orderIdQuery, setOrderIdQuery] = useState('');
  const [customerIdQuery, setCustomerIdQuery] = useState('');
  const [detailTarget, setDetailTarget] = useState(null);
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();

  const [filters, setFilters] = useState({ orderId: '', customerId: '' });

  const sortedOrders = useMemo(() => {
    const filtered = orderDetailsData.filter((order) => {
      const matchesOrder = filters.orderId ? order.id.toLowerCase().includes(filters.orderId.toLowerCase()) : true;
      const matchesCustomer = filters.customerId ? order.customerId.toLowerCase().includes(filters.customerId.toLowerCase()) : true;
      return matchesOrder && matchesCustomer;
    });
    if (!sortOrder) return filtered;
    const factor = sortOrder === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return (aTime - bTime) * factor;
    });
  }, [filters, sortOrder]);

  return (
    <Box bg={cardBg} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor={borderColor} p={6} color={textColor}>
      <Flex justify="space-between" align="flex-end" mb={4} gap={3} flexWrap="nowrap">
        <Flex gap={3} align="center" flexWrap="nowrap">
          <FormControl minW="260px" display="flex" alignItems="center" gap={2}>
            <FormLabel mb={0} whiteSpace="nowrap">
              订单编号
            </FormLabel>
            <Input size="sm" placeholder="输入订单编号" value={orderIdQuery} onChange={(event) => setOrderIdQuery(event.target.value)} />
          </FormControl>
          <FormControl minW="260px" display="flex" alignItems="center" gap={2}>
            <FormLabel mb={0} whiteSpace="nowrap">
              下单人ID
            </FormLabel>
            <Input size="sm" placeholder="输入下单人ID" value={customerIdQuery} onChange={(event) => setCustomerIdQuery(event.target.value)} />
          </FormControl>
          <FormControl minW="260px" display="flex" alignItems="center" gap={2}>
            <Button
              size="sm"
              colorScheme="teal"
              onClick={() =>
                setFilters({
                  orderId: orderIdQuery.trim(),
                  customerId: customerIdQuery.trim(),
                })
              }
            >
              查询
            </Button>
          </FormControl>
        </Flex>

        <Button size="sm" variant="ghost" onClick={() => setSortOrder(null)}>
          恢复默认排序
        </Button>
      </Flex>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>订单编号</Th>
              <Th>下单人ID</Th>
              <Th>下单人</Th>
              <Th cursor="pointer" onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))} _hover={{ bg: headerHover }}>
                创建时间 {sortOrder ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </Th>
              <Th textAlign="center">操作</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedOrders.map((order, index) => (
              <Tr key={order.id} bg={index % 2 === 1 ? zebra : 'transparent'}>
                <Td>{order.id}</Td>
                <Td>{order.customerId}</Td>
                <Td>{order.customer}</Td>
                <Td>{order.createdAt}</Td>
                <Td textAlign="center">
                  <Tooltip label="查看完整订单信息" hasArrow>
                    <IconButton
                      aria-label="查看完整订单信息"
                      icon={<FiSearch />}
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setDetailTarget(order);
                        onDetailOpen();
                      }}
                    />
                  </Tooltip>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <Modal isOpen={isDetailOpen} onClose={onDetailClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>订单详情</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {detailTarget ? (
              <Box display="grid" gridTemplateColumns="120px 1fr" rowGap={2} columnGap={3} color={textColor}>
                <Text fontWeight="semibold">订单编号</Text>
                <Text>{detailTarget.id}</Text>
                <Text fontWeight="semibold">下单人ID</Text>
                <Text>{detailTarget.customerId}</Text>
                <Text fontWeight="semibold">下单人</Text>
                <Text>{detailTarget.customer}</Text>
                <Text fontWeight="semibold">创建时间</Text>
                <Text>{detailTarget.createdAt}</Text>
              </Box>
            ) : (
              <Text color={textColor}>暂无订单信息</Text>
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

export default OrderDetailsPage;
