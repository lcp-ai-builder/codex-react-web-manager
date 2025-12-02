import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
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
  Text,
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
import { FiEdit2, FiPlus, FiKey } from 'react-icons/fi';
import DataTable from '@/components/DataTable.jsx';
import { fetchRoles as fetchRolesApi, createRole, updateRole, updateRoleIsOpen } from '@/services/manager-service.js';
import usePagedList from '@/hooks/usePagedList.js';
import { isOpenEnabled } from '@/utils/status.js';

const PAGE_SIZE = 10;
const statusColorScheme = {
  open: 'green',
  closed: 'gray',
};

const RolesPage = () => {
  // 角色数据与分页状态，数据来源后端
  const {
    items: roles,
    setItems: setRoles,
    setTotalItems,
    currentPage,
    totalPages,
    loading,
    loadPage,
  } = usePagedList({
    pageSize: PAGE_SIZE,
    initialData: [],
    fetchPage: ({ page, pageSize, signal }) =>
      fetchRolesApi({
        page,
        pageSize,
        signal,
      }),
    onError: (error, { page }) => {
      console.warn('获取角色列表失败：', error);
      toast({
        title: '获取角色列表失败',
        status: 'error',
        position: 'top',
        duration: 3000,
        isClosable: true,
      });
      if (page === 1) return;
    },
  });
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    isOpen: 1,
  });
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    code: '',
    description: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusConfirm, setStatusConfirm] = useState({ isOpen: false, role: null, nextIsOpen: 1 });
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const statusCancelRef = useRef();

  const mutedText = useColorModeValue('gray.600', 'gray.400');

  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const toast = useToast();

  const normalizeIsOpen = (value) => (Number(value) === 1 ? 1 : 0);

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    loadPage(nextPage);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === 'isOpen' ? Number(value) : value;
    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
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
      isOpen: 1,
    });
    onAddOpen();
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.code.trim()) return;
    const payloadData = { ...formData, isOpen: normalizeIsOpen(formData.isOpen) };
    setIsSaving(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const payload = await createRole({ data: payloadData, signal: controller.signal });

      const roleFromApi = payload?.data && typeof payload.data === 'object' ? payload.data : payload && typeof payload === 'object' ? payload : null;
      const newRole =
        roleFromApi && typeof roleFromApi === 'object'
          ? { ...payloadData, ...roleFromApi }
          : {
              id: `R${String(Date.now()).slice(-5)}`,
              createdAt: new Date().toISOString().slice(0, 10),
              ...payloadData,
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
  const handleOpenEdit = useCallback(
    (role) => {
      setEditFormData({
        id: role.id,
        name: role.name,
        code: role.code,
        description: role.description || '',
      });
      onEditOpen();
    },
    [onEditOpen]
  );

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

      const updatedRole = payload?.data && typeof payload.data === 'object' ? payload.data : payload && typeof payload === 'object' ? payload : null;
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
  const handleToggleStatus = useCallback((role) => {
    const active = isOpenEnabled(role.isOpen ?? role.status);
    const nextIsOpen = active ? 0 : 1;
    setStatusConfirm({ isOpen: true, role, nextIsOpen });
  }, []);

  const closeStatusConfirm = () => setStatusConfirm({ isOpen: false, role: null, nextIsOpen: 1 });

  const handleConfirmStatus = async () => {
    if (!statusConfirm.role) return;
    setIsStatusUpdating(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    try {
      const payload = await updateRoleIsOpen({
        id: statusConfirm.role.id,
        isOpen: statusConfirm.nextIsOpen,
        signal: controller.signal,
      });
      const returnedRole = payload?.data && typeof payload.data === 'object' ? payload.data : payload && typeof payload === 'object' ? payload : null;
      const merged = returnedRole ? { ...statusConfirm.role, ...returnedRole } : { ...statusConfirm.role, isOpen: statusConfirm.nextIsOpen };

      setRoles((prev) => prev.map((role) => (role.id === statusConfirm.role.id ? merged : role)));
      toast({
        title: statusConfirm.nextIsOpen === 1 ? '角色已启用' : '角色已停用',
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

  const columns = useMemo(
    () => [
      {
        header: '角色名',
        render: (role) => <Text fontWeight="medium">{role.name}</Text>,
      },
      { header: '角色标识', render: (role) => role.code },
      {
        header: '描述',
        render: (role) => (
          <Text color={mutedText} noOfLines={2}>
            {role.description || '—'}
          </Text>
        ),
      },
      {
        header: '状态',
        render: (role) => {
          const active = isOpenEnabled(role.isOpen ?? role.status);
          return (
            <Badge colorScheme={statusColorScheme[active ? 'open' : 'closed'] || 'gray'}>
              <Text as="span" color={active ? 'inherit' : 'red.500'}>
                {active ? '启用' : '停用'}
              </Text>
            </Badge>
          );
        },
        visible: false,
      },
      { header: '创建时间', render: (role) => role.createdAt || '—' },
      {
        header: '启用/停用',
        render: (role) => {
          const active = isOpenEnabled(role.isOpen ?? role.status);
          return (
            <HStack spacing={2}>
              <Switch isChecked={active} onChange={() => handleToggleStatus(role)} isDisabled={isStatusUpdating} colorScheme="teal" size="sm" />
              <Text fontSize="sm" color={mutedText}>
                {active ? '启用' : '停用'}
              </Text>
            </HStack>
          );
        },
      },
      {
        header: '操作',
        align: 'right',
        render: (role) => (
          <HStack justify="flex-end" spacing={3}>
            <IconButton aria-label="编辑角色" icon={<FiEdit2 />} size="sm" variant="ghost" onClick={() => handleOpenEdit(role)} />
          </HStack>
        ),
      },
    ],
    [handleToggleStatus, handleOpenEdit, isStatusUpdating, mutedText]
  );

  return (
    <Box>
      <DataTable
        columns={columns}
        data={roles}
        rowKey={(item) => item.id}
        pagination={{ currentPage, totalPages, onPageChange: handlePageChange, isLoading: loading }}
        getRowProps={(role) => {
          const active = isOpenEnabled(role.isOpen ?? role.status);
          return active ? {} : { color: mutedText, opacity: 0.75 };
        }}
        title="角色管理"
        headerIcon={FiKey}
        addText="新建角色"
        addIcon={FiPlus}
        onAdd={handleOpenAdd}
      />

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
              <FormLabel>是否开启</FormLabel>
              <Select name="isOpen" value={formData.isOpen} onChange={handleInputChange}>
                <option value={1}>启用</option>
                <option value={0}>停用</option>
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
              确认{statusConfirm.nextIsOpen === 1 ? '启用' : '停用'}
            </AlertDialogHeader>
            <AlertDialogBody>
              是否将角色「{statusConfirm.role?.name}」设置为
              {statusConfirm.nextIsOpen === 1 ? '启用' : '停用'}状态？
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
