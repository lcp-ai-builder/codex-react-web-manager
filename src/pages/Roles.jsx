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
  Switch,
} from '@chakra-ui/react';
import { FiEdit2, FiPlus } from 'react-icons/fi';
import Pagination from '@/components/Pagination.jsx';
import { rolesData } from '@/data/roles.js';
import { fetchRoles as fetchRolesApi, createRole, updateRole, updateRoleStatus } from '@/services/api-services.js';

const PAGE_SIZE = 10;

const RolesPage = () => {
  // 角色数据与分页状态，默认读取本地 mock
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
  const [selectedRole, setSelectedRole] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusConfirm, setStatusConfirm] = useState({ isOpen: false, role: null, nextStatus: 'active' });
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const statusCancelRef = useRef();

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / PAGE_SIZE)), [totalItems]);

  const tableBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const mutedText = useColorModeValue('gray.600', 'gray.400');

  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const toast = useToast();

  const statusColorScheme = {
    active: 'green',
    inactive: 'gray',
  };

  // 统一封装列表请求，优先走接口，失败时回落到本地数据
  const fetchRoles = useCallback(
    async (page = 1) => {
      const controller = new AbortController();
      try {
        const payload = await fetchRolesApi({
          page,
          pageSize: PAGE_SIZE,
          signal: controller.signal,
        });

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
        const total = typeof payload?.data?.total === 'number' ? payload.data.total : typeof payload?.total === 'number' ? payload.total : list.length;

        setRoles(list);
        setTotalItems(total);
        setCurrentPage(page);
      } catch (error) {
        console.warn('获取角色列表失败：', error);
        toast({
          title: '获取角色列表失败',
          status: 'error',
          position: 'top',
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
      const payload = await createRole({ data: formData, signal: controller.signal });

      const roleFromApi =
        payload?.data && typeof payload.data === 'object'
          ? payload.data
          : payload && typeof payload === 'object'
          ? payload
          : null;
      const newRole =
        roleFromApi && typeof roleFromApi === 'object'
          ? { ...formData, ...roleFromApi }
          : {
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
        position: 'top',
        duration: 2500,
        isClosable: true,
      });
    } catch (error) {
      console.warn('新增角色失败：', error);
      toast({
        title: '新增角色失败',
        status: 'error',
        position: 'top',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      clearTimeout(timeoutId);
      setIsSaving(false);
    }
  };

  // 打开编辑框时带入选中行数据，保持输入框受控
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
      const payload = await updateRole({
        id: editFormData.id,
        data: editFormData,
        signal: controller.signal,
      });

      const updatedRole =
        payload?.data && typeof payload.data === 'object'
          ? payload.data
          : payload && typeof payload === 'object'
          ? payload
          : null;
      const mergedRole = updatedRole ? { ...editFormData, ...updatedRole } : editFormData;

      setRoles((prev) => prev.map((role) => (role.id === editFormData.id ? { ...role, ...mergedRole } : role)));
      onEditClose();
      toast({
        title: '角色更新成功',
        status: 'success',
        position: 'top',
        duration: 2500,
        isClosable: true,
      });
    } catch (error) {
      console.warn('更新角色失败：', error);
      toast({
        title: '更新角色失败',
        status: 'error',
        position: 'top',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      clearTimeout(timeoutId);
      setIsUpdating(false);
    }
  };

  // 删除前先记录目标，弹出确认框避免误删
  const handleToggleStatus = (role) => {
    const nextStatus = role.status === 'active' ? 'inactive' : 'active';
    setStatusConfirm({ isOpen: true, role, nextStatus });
  };

  const closeStatusConfirm = () => setStatusConfirm({ isOpen: false, role: null, nextStatus: 'active' });

  const handleConfirmStatus = async () => {
    if (!statusConfirm.role) return;
    setIsStatusUpdating(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    try {
      const payload = await updateRoleStatus({
        id: statusConfirm.role.id,
        status: statusConfirm.nextStatus,
        signal: controller.signal,
      });
      const returnedRole =
        payload?.data && typeof payload.data === 'object'
          ? payload.data
          : payload && typeof payload === 'object'
          ? payload
          : null;
      const merged = returnedRole
        ? { ...statusConfirm.role, ...returnedRole }
        : { ...statusConfirm.role, status: statusConfirm.nextStatus };

      setRoles((prev) => prev.map((role) => (role.id === statusConfirm.role.id ? merged : role)));
      toast({
        title: statusConfirm.nextStatus === 'active' ? '角色已启用' : '角色已停用',
        status: 'success',
        position: 'top',
        duration: 2500,
        isClosable: true,
      });
    } catch (error) {
      console.warn('更新角色状态失败：', error);
      toast({
        title: '更新角色状态失败',
        status: 'error',
        position: 'top',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      clearTimeout(timeoutId);
      setIsStatusUpdating(false);
      closeStatusConfirm();
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

      <TableContainer bg={tableBg} borderRadius="lg" boxShadow="sm" border="1px solid" borderColor={borderColor}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>角色名</Th>
              <Th>角色标识</Th>
              <Th>描述</Th>
              <Th>状态</Th>
              <Th>创建时间</Th>
              <Th>启用/停用</Th>
              <Th textAlign="right">操作</Th>
            </Tr>
          </Thead>
          <Tbody>
            {roles.map((role, index) => (
              <Tr key={role.id} bg={index % 2 === 0 ? 'transparent' : useColorModeValue('gray.50', 'gray.700')}>
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
                    <Text as="span" color={role.status === 'inactive' ? 'red.500' : 'inherit'}>
                      {role.status === 'active' ? '启用' : '停用'}
                    </Text>
                  </Badge>
                </Td>
                <Td>{role.createdAt || '—'}</Td>
                <Td>
                  <HStack spacing={2}>
                    <Switch
                      isChecked={role.status === 'active'}
                      onChange={() => handleToggleStatus(role)}
                      isDisabled={isStatusUpdating}
                      colorScheme="teal"
                      size="sm"
                    />
                    <Text fontSize="sm" color={mutedText}>
                      {role.status === 'active' ? '启用' : '停用'}
                    </Text>
                  </HStack>
                </Td>
                <Td textAlign="right">
                  <HStack justify="flex-end" spacing={3}>
                    <IconButton aria-label="编辑角色" icon={<FiEdit2 />} size="sm" variant="ghost" onClick={() => handleOpenEdit(role)} />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <Flex justify="flex-end" mt={4}>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </Flex>

      <Modal isOpen={isAddOpen} onClose={onAddClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>新建角色</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4} isRequired>
              <FormLabel>角色名</FormLabel>
              <Input name="name" placeholder="请输入角色名称" value={formData.name} onChange={handleInputChange} />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>角色标识</FormLabel>
              <Input name="code" placeholder="如 user, guest" value={formData.code} onChange={handleInputChange} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>描述</FormLabel>
              <Input name="description" placeholder="可填写角色说明" value={formData.description} onChange={handleInputChange} />
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
            <Button mr={3} onClick={onAddClose}>
              取消
            </Button>
            <Button colorScheme="teal" onClick={handleSave} isLoading={isSaving}>
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
              <Input name="name" value={editFormData.name} onChange={handleEditInputChange} />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>角色标识</FormLabel>
              <Input name="code" value={editFormData.code} onChange={handleEditInputChange} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>描述</FormLabel>
              <Input name="description" value={editFormData.description} onChange={handleEditInputChange} />
            </FormControl>
            <FormControl>
              <FormLabel>状态</FormLabel>
              <Select name="status" value={editFormData.status} onChange={handleEditInputChange}>
                <option value="active">启用</option>
                <option value="inactive">停用</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onEditClose}>
              取消
            </Button>
            <Button colorScheme="teal" onClick={handleUpdate} isLoading={isUpdating}>
              保存修改
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog isOpen={statusConfirm.isOpen} leastDestructiveRef={statusCancelRef} onClose={closeStatusConfirm} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              确认{statusConfirm.nextStatus === 'active' ? '启用' : '停用'}
            </AlertDialogHeader>
            <AlertDialogBody>
              是否将角色「{statusConfirm.role?.name}」设置为
              {statusConfirm.nextStatus === 'active' ? '启用' : '停用'}状态？
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={statusCancelRef} onClick={closeStatusConfirm}>
                取消
              </Button>
              <Button colorScheme="teal" onClick={handleConfirmStatus} ml={3} isLoading={isStatusUpdating}>
                确认
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default RolesPage;
