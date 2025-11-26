import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
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
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import Pagination from '@/components/Pagination.jsx';
import { API_BASE_URL } from '@/config/api.js';
import { rolesData } from '@/data/roles.js';

const PAGE_SIZE = 10;

const RolesPage = () => {
  const [roles, setRoles] = useState(rolesData);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(rolesData.length);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'active',
  });
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    code: '',
    description: '',
    status: 'active',
  });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / PAGE_SIZE)),
    [totalItems]
  );

  const tableBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const mutedText = useColorModeValue('gray.600', 'gray.400');

  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const deleteCancelRef = useRef();
  const toast = useToast();

  const statusColorScheme = {
    active: 'green',
    inactive: 'gray',
  };

  const fetchRoles = useCallback(
    async (page = 1) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/roles?page=${page}&pageSize=${PAGE_SIZE}`
        );
        const payload = await response
          .json()
          .catch(() => ({ data: rolesData, total: rolesData.length }));

        if (!response.ok) {
          throw new Error('Request failed');
        }

        const listCandidate = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data?.list)
          ? payload.data.list
          : Array.isArray(payload?.data?.records)
          ? payload.data.records
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.list)
          ? payload.list
          : Array.isArray(payload?.records)
          ? payload.records
          : [];
        const list = listCandidate.length ? listCandidate : rolesData;
        const total =
          typeof payload?.data?.total === 'number'
            ? payload.data.total
            : typeof payload?.total === 'number'
            ? payload.total
            : list.length;

        setRoles(list);
        setTotalItems(total);
        setCurrentPage(page);
      } catch (error) {
        console.warn('获取角色列表失败：', error);
        toast({
          title: '获取角色列表失败',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        if (page === 1) {
          setRoles(rolesData);
          setTotalItems(rolesData.length);
        }
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchRoles(1);
  }, [fetchRoles]);

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    fetchRoles(nextPage);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      status: 'active',
    });
    onAddOpen();
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.code.trim()) return;
    setIsSaving(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch(`${API_BASE_URL}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error('Request failed');
      }

      const newRole = {
        id: `R${String(Date.now()).slice(-5)}`,
        createdAt: new Date().toISOString().slice(0, 10),
        ...formData,
      };
      setRoles((prev) => [newRole, ...prev]);
      setTotalItems((prev) => prev + 1);
      onAddClose();
      toast({
        title: '角色创建成功',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
    } catch (error) {
      console.warn('新增角色失败：', error);
      toast({
        title: '新增角色失败',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      clearTimeout(timeoutId);
      setIsSaving(false);
    }
  };

  const handleOpenEdit = (role) => {
    setSelectedRole(role);
    setEditFormData({
      id: role.id,
      name: role.name,
      code: role.code,
      description: role.description || '',
      status: role.status || 'active',
    });
    onEditOpen();
  };

  const handleUpdate = async () => {
    if (!editFormData.name.trim() || !editFormData.code.trim()) return;
    setIsUpdating(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    try {
      const response = await fetch(
        `${API_BASE_URL}/roles/${encodeURIComponent(editFormData.id)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editFormData),
          signal: controller.signal,
        }
      );
      if (!response.ok) {
        throw new Error('Request failed');
      }

      setRoles((prev) =>
        prev.map((role) =>
          role.id === editFormData.id ? { ...role, ...editFormData } : role
        )
      );
      onEditClose();
      toast({
        title: '角色更新成功',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
    } catch (error) {
      console.warn('更新角色失败：', error);
      toast({
        title: '更新角色失败',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      clearTimeout(timeoutId);
      setIsUpdating(false);
    }
  };

  const handleOpenDelete = (role) => {
    setDeleteTarget(role);
    onDeleteOpen();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    try {
      const response = await fetch(
        `${API_BASE_URL}/roles/${encodeURIComponent(deleteTarget.id)}`,
        {
          method: 'DELETE',
          signal: controller.signal,
        }
      );
      if (!response.ok) {
        throw new Error('Request failed');
      }

      setRoles((prev) => prev.filter((role) => role.id !== deleteTarget.id));
      setTotalItems((prev) => Math.max(0, prev - 1));
      onDeleteClose();
      toast({
        title: '角色删除成功',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
    } catch (error) {
      console.warn('删除角色失败：', error);
      toast({
        title: '删除角色失败',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      clearTimeout(timeoutId);
      setIsDeleting(false);
    }
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">角色管理</Heading>
        <Button leftIcon={<FiPlus />} colorScheme="teal" onClick={handleOpenAdd}>
          新建角色
        </Button>
      </Flex>

      <TableContainer
        bg={tableBg}
        borderRadius="lg"
        boxShadow="sm"
        border="1px solid"
        borderColor={borderColor}
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>角色名</Th>
              <Th>角色标识</Th>
              <Th>描述</Th>
              <Th>状态</Th>
              <Th>创建时间</Th>
              <Th textAlign="right">操作</Th>
            </Tr>
          </Thead>
          <Tbody>
            {roles.map((role) => (
              <Tr key={role.id}>
                <Td>
                  <Text fontWeight="medium">{role.name}</Text>
                </Td>
                <Td>{role.code}</Td>
                <Td>
                  <Text color={mutedText} noOfLines={2}>
                    {role.description || '—'}
                  </Text>
                </Td>
                <Td>
                  <Badge colorScheme={statusColorScheme[role.status] || 'gray'}>
                    {role.status === 'active' ? '启用' : '停用'}
                  </Badge>
                </Td>
                <Td>{role.createdAt || '—'}</Td>
                <Td textAlign="right">
                  <HStack justify="flex-end" spacing={3}>
                    <IconButton
                      aria-label="编辑角色"
                      icon={<FiEdit2 />}
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEdit(role)}
                    />
                    <IconButton
                      aria-label="删除角色"
                      icon={<FiTrash2 />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleOpenDelete(role)}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <Flex justify="flex-end" mt={4}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </Flex>

      <Modal isOpen={isAddOpen} onClose={onAddClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>新建角色</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4} isRequired>
              <FormLabel>角色名</FormLabel>
              <Input
                name="name"
                placeholder="请输入角色名称"
                value={formData.name}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>角色标识</FormLabel>
              <Input
                name="code"
                placeholder="如 user, guest"
                value={formData.code}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>描述</FormLabel>
              <Input
                name="description"
                placeholder="可填写角色说明"
                value={formData.description}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>状态</FormLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">启用</option>
                <option value="inactive">停用</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onAddClose}>
              取消
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleSave}
              isLoading={isSaving}
            >
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={onEditClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>编辑角色</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4} isRequired>
              <FormLabel>角色名</FormLabel>
              <Input
                name="name"
                value={editFormData.name}
                onChange={handleEditInputChange}
              />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>角色标识</FormLabel>
              <Input
                name="code"
                value={editFormData.code}
                onChange={handleEditInputChange}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>描述</FormLabel>
              <Input
                name="description"
                value={editFormData.description}
                onChange={handleEditInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>状态</FormLabel>
              <Select
                name="status"
                value={editFormData.status}
                onChange={handleEditInputChange}
              >
                <option value="active">启用</option>
                <option value="inactive">停用</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onEditClose}>
              取消
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleUpdate}
              isLoading={isUpdating}
            >
              保存修改
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={deleteCancelRef}
        onClose={onDeleteClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              确认删除
            </AlertDialogHeader>
            <AlertDialogBody>
              确定要删除角色「{deleteTarget?.name}」吗？该操作不可撤销。
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={deleteCancelRef} onClick={onDeleteClose}>
                取消
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDelete}
                ml={3}
                isLoading={isDeleting}
              >
                删除
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default RolesPage;
