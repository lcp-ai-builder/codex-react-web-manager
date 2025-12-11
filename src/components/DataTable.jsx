import { Box, Flex, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useColorModeValue, Heading, Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import Pagination from './Pagination.jsx';

const DataTable = ({ columns = [], data = [], rowKey = 'id', pagination, containerProps = {}, tableProps = {}, title, headerIcon: HeaderIcon, addText, addIcon: AddIcon, onAdd, getRowProps }) => {
  const { t } = useTranslation();
  const tableBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const zebraBg = useColorModeValue('gray.50', 'gray.700');

  const getRowKey = (item, index) => (typeof rowKey === 'function' ? rowKey(item, index) : item?.[rowKey]) ?? index;
  const visibleColumns = Array.isArray(columns) ? columns.filter((column) => column?.visible !== false) : [];
  const emptyColSpan = visibleColumns.length || columns.length || 1;

  return (
    <Box>
      {(title || HeaderIcon || (addText && onAdd)) && (
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="lg" display="flex" alignItems="center" gap={2}>
            {HeaderIcon ? <HeaderIcon /> : null}
            {title}
          </Heading>
          {addText && onAdd ? (
            <Button leftIcon={AddIcon ? <AddIcon /> : undefined} colorScheme="teal" onClick={onAdd}>
              {addText}
            </Button>
          ) : null}
        </Flex>
      )}

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
            {data.length === 0 ? (
              <Tr>
                <Td colSpan={emptyColSpan} textAlign="center">
                  {t('table.noData')}
                </Td>
              </Tr>
            ) : (
              data.map((item, index) => {
                const rowProps = typeof getRowProps === 'function' ? getRowProps(item, index) : {};
                return (
                  <Tr key={getRowKey(item, index)} bg={index % 2 === 0 ? 'transparent' : zebraBg} {...rowProps}>
                    {visibleColumns.map((column) => (
                      <Td key={`${getRowKey(item, index)}-${column.header}`} textAlign={column.align}>
                        {column.render ? column.render(item, index) : item?.[column.dataKey] ?? '—'}
                      </Td>
                    ))}
                  </Tr>
                );
              })
            )}
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
