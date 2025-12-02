import { Box, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useColorModeValue } from '@chakra-ui/react';
import { orderDetailsData } from '@/data/orderDetails.js';

const OrderDetailsPage = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const zebra = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('blue.600', 'blue.100');

  return (
    <Box bg={cardBg} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor={borderColor} p={6} color={textColor}>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>订单编号</Th>
              <Th>下单人</Th>
              <Th>创建时间</Th>
            </Tr>
          </Thead>
          <Tbody>
            {orderDetailsData.map((order, index) => (
              <Tr key={order.id} bg={index % 2 === 1 ? zebra : 'transparent'}>
                <Td>{order.id}</Td>
                <Td>{order.customer}</Td>
                <Td>{order.createdAt}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OrderDetailsPage;
