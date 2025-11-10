import { useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Flex,
  Heading,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue
} from '@chakra-ui/react';
import Pagination from '@/components/Pagination.jsx';
import { API_BASE_URL } from '@/config/api.js';

const PAGE_SIZE = 10;

const mockUsers = [
  { id: 'U001', name: '张伟', email: 'zhangwei@example.com', status: 'active', joinedAt: '2024-01-05' },
  { id: 'U002', name: '李娜', email: 'lina@example.com', status: 'active', joinedAt: '2024-01-08' },
  { id: 'U003', name: '王强', email: 'wangqiang@example.com', status: 'inactive', joinedAt: '2024-01-12' },
  { id: 'U004', name: '刘敏', email: 'liumin@example.com', status: 'active', joinedAt: '2024-01-15' },
  { id: 'U005', name: '陈杰', email: 'chenjie@example.com', status: 'active', joinedAt: '2024-01-20' },
  { id: 'U006', name: '赵丽', email: 'zhaoli@example.com', status: 'active', joinedAt: '2024-01-23' },
  { id: 'U007', name: '孙浩', email: 'sunhao@example.com', status: 'inactive', joinedAt: '2024-01-28' },
  { id: 'U008', name: '周婷', email: 'zhouting@example.com', status: 'active', joinedAt: '2024-02-02' },
  { id: 'U009', name: '吴磊', email: 'wulei@example.com', status: 'active', joinedAt: '2024-02-06' },
  { id: 'U010', name: '郑爽', email: 'zhengshuang@example.com', status: 'inactive', joinedAt: '2024-02-10' },
  { id: 'U011', name: '冯媛', email: 'fengyuan@example.com', status: 'active', joinedAt: '2024-02-12' },
  { id: 'U012', name: '褚昊', email: 'chuhao@example.com', status: 'active', joinedAt: '2024-02-15' },
  { id: 'U013', name: '卫明', email: 'weiming@example.com', status: 'inactive', joinedAt: '2024-02-18' },
  { id: 'U014', name: '蒋丽', email: 'jiangli@example.com', status: 'active', joinedAt: '2024-02-20' },
  { id: 'U015', name: '沈晨', email: 'shenchen@example.com', status: 'active', joinedAt: '2024-02-24' },
  { id: 'U016', name: '韩雪', email: 'hanxue@example.com', status: 'active', joinedAt: '2024-02-26' },
  { id: 'U017', name: '蔡坤', email: 'caikun@example.com', status: 'inactive', joinedAt: '2024-02-28' },
  { id: 'U018', name: '鲁洋', email: 'luyang@example.com', status: 'active', joinedAt: '2024-03-02' }
];

const RegularUsersPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(mockUsers.length / PAGE_SIZE);

  const tableBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const mutedText = useColorModeValue('gray.600', 'gray.400');

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    fetch(`${API_BASE_URL}/check1?page=${nextPage}`).catch(() => {});
    setCurrentPage(nextPage);
  };

  const currentUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return mockUsers.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage]);

  const renderStatus = (status) => {
    const isActive = status === 'active';
    return (
      <Badge colorScheme={isActive ? 'teal' : 'orange'} variant="subtle">
        {isActive ? '启用' : '停用'}
      </Badge>
    );
  };

  return (
    <Box p={{ base: 4, md: 8 }}>
      <Heading size="lg" mb={6}>
        普通用户
      </Heading>
      <Box bg={tableBg} borderRadius="lg" border="1px solid" borderColor={borderColor} boxShadow="sm">
        <Box px={6} py={4} borderBottom="1px solid" borderColor={borderColor}>
          <Text color={mutedText}>
            共 {mockUsers.length} 位普通用户，默认每页展示 {PAGE_SIZE} 条数据。
          </Text>
        </Box>
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>用户ID</Th>
                <Th>姓名</Th>
                <Th>邮箱</Th>
                <Th>状态</Th>
                <Th isNumeric>加入时间</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentUsers.map((user) => (
                <Tr key={user.id}>
                  <Td>{user.id}</Td>
                  <Td>{user.name}</Td>
                  <Td>{user.email}</Td>
                  <Td>{renderStatus(user.status)}</Td>
                  <Td isNumeric>{user.joinedAt}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
        <Flex
          align="center"
          justify="space-between"
          px={6}
          py={4}
          borderTop="1px solid"
          borderColor={borderColor}
          flexWrap="wrap"
          gap={4}
        >
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={mockUsers.length}
            pageSize={PAGE_SIZE}
            colorScheme="teal"
          />
        </Flex>
      </Box>
    </Box>
  );
};

export default RegularUsersPage;
