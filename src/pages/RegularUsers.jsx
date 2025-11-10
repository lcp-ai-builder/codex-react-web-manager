import { useMemo, useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import Pagination from '@/components/Pagination.jsx';
import { API_BASE_URL } from '@/config/api.js';
import { regularUsersData } from '@/data/regularUsers.js';

const PAGE_SIZE = 10;

const RegularUsersPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    status: 'active'
  });
  const [isSaving, setIsSaving] = useState(false);
  const totalPages = Math.ceil(regularUsersData.length / PAGE_SIZE);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isSuccessOpen,
    onOpen: onSuccessOpen,
    onClose: onSuccessClose
  } = useDisclosure();
  const successCancelRef = useRef();
  const toast = useToast();

  const tableBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const mutedText = useColorModeValue('gray.600', 'gray.400');

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    fetch(`${API_BASE_URL}/check1?page=${nextPage}`).catch(() => {});
    setCurrentPage(nextPage);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenModal = () => {
    setFormData({
      name: '',
      email: '',
      status: 'active'
    });
    onOpen();
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) return;
    setIsSaving(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    try {
      const response = await fetch(`${API_BASE_URL}/addNewUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        signal: controller.signal
      });
      if (!response.ok) {
        throw new Error('Request failed');
      }
      onClose();
      onSuccessOpen();
    } catch {
      toast({
        title: 'api无法访问',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      clearTimeout(timeoutId);
      setIsSaving(false);
    }
  };

  const currentUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return regularUsersData.slice(startIndex, startIndex + PAGE_SIZE);
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
        <Flex
          px={6}
          py={4}
          borderBottom="1px solid"
          borderColor={borderColor}
          align="center"
          justify="flex-start"
        >
          <Button colorScheme="teal" onClick={handleOpenModal}>
            添加新用户
          </Button>
        </Flex>
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
            totalItems={regularUsersData.length}
            pageSize={PAGE_SIZE}
            colorScheme="teal"
          />
        </Flex>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>添加新用户</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>姓名</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="请输入用户姓名"
              />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>邮箱</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="user@example.com"
              />
            </FormControl>
            <FormControl>
              <FormLabel>状态</FormLabel>
              <Select name="status" value={formData.status} onChange={handleInputChange}>
                <option value="active">启用</option>
                <option value="inactive">停用</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              取消
            </Button>
            <Button colorScheme="teal" onClick={handleSave} isLoading={isSaving}>
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <AlertDialog
        isOpen={isSuccessOpen}
        leastDestructiveRef={successCancelRef}
        onClose={onSuccessClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              添加完成
            </AlertDialogHeader>
            <AlertDialogBody>新用户已成功添加。</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={successCancelRef} colorScheme="teal" onClick={onSuccessClose}>
                确定
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default RegularUsersPage;
