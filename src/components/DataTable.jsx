import { Box, Flex, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useColorModeValue } from '@chakra-ui/react';
import Pagination from './Pagination.jsx';

const DataTable = ({ columns = [], data = [], rowKey = 'id', pagination, containerProps = {}, tableProps = {} }) => {
  const tableBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const zebraBg = useColorModeValue('gray.50', 'gray.700');

  const getRowKey = (item, index) => (typeof rowKey === 'function' ? rowKey(item, index) : item?.[rowKey]) ?? index;
  const visibleColumns = Array.isArray(columns) ? columns.filter((column) => column?.visible !== false) : [];

  return (
    <Box>
      <TableContainer bg={tableBg} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor={borderColor} {...containerProps}>
        <Table variant="simple" {...tableProps}>
          <Thead>
            <Tr>
              {visibleColumns.map((column) => (
                <Th key={column.header} width={column.width} textAlign={column.align}>
                  {column.header}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {data.map((item, index) => (
              <Tr key={getRowKey(item, index)} bg={index % 2 === 0 ? 'transparent' : zebraBg}>
                {visibleColumns.map((column) => (
                  <Td key={`${getRowKey(item, index)}-${column.header}`} textAlign={column.align}>
                    {column.render ? column.render(item, index) : item?.[column.dataKey] ?? '—'}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {pagination ? (
        <Flex justify="flex-end" mt={4}>
          <Pagination {...pagination} />
        </Flex>
      ) : null}
    </Box>
  );
};

export default DataTable;
