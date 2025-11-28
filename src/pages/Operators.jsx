import { useCallback, useEffect, useMemo, useState } from 'react';
import {
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
  SimpleGrid,
  Tooltip,
  IconButton,
} from '@chakra-ui/react';
import { FiEdit2, FiPlus, FiSearch } from 'react-icons/fi';
import DataTable from '@/components/DataTable.jsx';
import { operatorsData } from '@/data/operators.js';
import { rolesData as rolesMock } from '@/data/roles.js';
import { fetchOperators, createOperator, updateOperator, fetchRoles as fetchRolesApi } from '@/services/api-services.js';

const PAGE_SIZE = 10;

const OperatorsPage = () => {
  const [operators, setOperators] = useState(operatorsData);
  const [rolesOptions, setRolesOptions] = useState(rolesMock);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(operatorsData.length);
  const [formData, setFormData] = useState({
    operatorNo: '',
    name: '',
    loginName: '',
    loginPassword: '',
    phone: '',
    email: '',
    roleId: rolesOptions[0]?.id || '',
    status: 'ACTIVE',
  });
  const [editFormData, setEditFormData] = useState({
    id: '',
    operatorNo: '',
    name: '',
    loginName: '',
    phone: '',
    email: '',
    roleId: rolesOptions[0]?.id || '',
    status: 'ACTIVE',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [detailTarget, setDetailTarget] = useState(null);
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / PAGE_SIZE)), [totalItems]);

  const mutedText = useColorModeValue('gray.600', 'gray.400');

  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const toast = useToast();

  const statusColorScheme = {
    ACTIVE: 'green',
    INACTIVE: 'gray',
    active: 'green',
    inactive: 'gray',
  };

  // 角色选项：优先拉取后端，失败回落到 mock
  const fetchRolesOptions = useCallback(async () => {
    try {
      const payload = await fetchRolesApi({ page: 1, pageSize: 100 });
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
      const list = (listCandidate.length ? listCandidate : rolesMock).map((role, idx) => ({
        ...role,
        id: typeof role.id === 'number' ? role.id : Number(role.id) || idx + 1,
      }));
      setRolesOptions(list);
      // 同步表单默认角色
      if (!formData.roleId && list[0]?.id) {
        setFormData((prev) => ({ ...prev, roleId: list[0].id }));
      }
      if (!editFormData.roleId && list[0]?.id) {
        setEditFormData((prev) => ({ ...prev, roleId: list[0].id }));
      }
    } catch (error) {
      console.warn('获取角色选项失败：', error);
      setRolesOptions(rolesMock);
    }
  }, [formData.roleId, editFormData.roleId]);

  const fetchList = useCallback(
    async (page = 1) => {
      try {
        const payload = await fetchOperators({ page, pageSize: PAGE_SIZE, signal: undefined });
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
        const list = listCandidate.length ? listCandidate : operatorsData;
        const total = typeof payload?.data?.total === 'number' ? payload.data.total : typeof payload?.total === 'number' ? payload.total : list.length;

        setOperators(list);
        setTotalItems(total);
        setCurrentPage(page);
      } catch (error) {
        console.warn('获取操作员列表失败：', error);
        toast({
          title: '获取操作员列表失败',
          status: 'error',
          position: 'top',
          duration: 3000,
          isClosable: true,
        });
        if (page === 1) {
          setOperators(operatorsData);
          setTotalItems(operatorsData.length);
        }
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchList(1);
    fetchRolesOptions();
  }, [fetchList, fetchRolesOptions]);

  useEffect(() => {
    if (!formData.roleId && rolesOptions[0]?.id) {
      setFormData((prev) => ({ ...prev, roleId: rolesOptions[0].id }));
    }
    if (!editFormData.roleId && rolesOptions[0]?.id) {
      setEditFormData((prev) => ({ ...prev, roleId: rolesOptions[0].id }));
    }
  }, [rolesOptions]); 

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    fetchList(nextPage);
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
      operatorNo: `OP${String(Date.now()).slice(-5)}`,
      name: '',
      loginName: '',
      loginPassword: '',
      phone: '',
      email: '',
      roleId: rolesOptions[0]?.id || '',
      status: 'ACTIVE',
    });
    onAddOpen();
  };

  const handleSave = async () => {
    const roleIdValue = formData.roleId ?? '';
    if (
      !formData.operatorNo.trim() ||
      !formData.name.trim() ||
      !formData.loginName.trim() ||
      !formData.phone.trim() ||
      (typeof roleIdValue === 'string' ? !roleIdValue.trim() : roleIdValue === null || roleIdValue === undefined)
    ) {
      toast({
        title: '请填写必填项',
        status: 'warning',
        position: 'top',
        duration: 2500,
        isClosable: true,
      });
      return;
    }
    setIsSaving(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const payloadData = {
        operatorNo: formData.operatorNo,
        name: formData.name,
        loginName: formData.loginName,
        phone: formData.phone,
        roleId: Number(formData.roleId) || formData.roleId,
      };
      if (formData.email) payloadData.email = formData.email;

      const payload = await createOperator({
        data: payloadData,
        signal: controller.signal,
      });
      const roleInfo = rolesOptions.find((r) => r.id === formData.roleId);
      const operatorFromApi = payload?.data && typeof payload.data === 'object' ? payload.data : payload && typeof payload === 'object' ? payload : null;
      const newOperator =
        operatorFromApi && typeof operatorFromApi === 'object'
          ? { ...formData, ...operatorFromApi, loginPassword: undefined }
          : {
              id: `OP${String(Date.now()).slice(-5)}`,
              operatorNo: formData.operatorNo || `OP${String(Date.now()).slice(-5)}`,
              code: formData.operatorNo || `OP${String(Date.now()).slice(-5)}`,
              createdAt: new Date().toISOString().slice(0, 10),
              lastLoginAt: '-',
              ...formData,
              status: (formData.status || 'ACTIVE').toUpperCase(),
              roleName: roleInfo?.name,
              loginPassword: undefined,
            };
      setOperators((prev) => [newOperator, ...prev]);
      setTotalItems((prev) => prev + 1);
      onAddClose();
      toast({
        title: '操作员创建成功',
        status: 'success',
        position: 'top',
        duration: 2500,
        isClosable: true,
      });
    } catch (error) {
      console.warn('新增操作员失败：', error);
      toast({
        title: '新增操作员失败',
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

  const handleOpenEdit = (operator) => {
    setEditFormData({
      id: operator.id,
      operatorNo: operator.operatorNo || operator.operator_no || operator.code || '',
      name: operator.name || '',
      loginName: operator.loginName || '',
      phone: operator.phone || '',
      email: operator.email || '',
      roleId: operator.roleId || operator.role_id || rolesOptions.find((r) => r.name === operator.roleName)?.id || rolesOptions[0]?.id || '',
      status: operator.status || 'ACTIVE',
    });
    onEditOpen();
  };

  const handleOpenDetail = (operator) => {
    setDetailTarget(operator);
    onDetailOpen();
  };

  const columns = useMemo(
    () => [
      {
        header: '编号',
        render: (operator) => operator.operatorNo || operator.operator_no || operator.code || operator.id,
      },
      {
        header: '姓名',
        render: (operator) => <Text fontWeight="medium">{operator.name}</Text>,
      },
      {
        header: '登录名',
        render: (operator) => operator.loginName,
        visible: false,
      },
      {
        header: '联系电话',
        render: (operator) => operator.phone || '—',
      },
      {
        header: '电子邮箱',
        render: (operator) => operator.email || '—',
        visible: false,
      },
      {
        header: '所属角色',
        render: (operator) => operator.roleName || rolesOptions.find((r) => r.id === operator.roleId || r.id === operator.role_id)?.name || '—',
      },
      {
        header: '状态',
        render: (operator) => (
          <Badge colorScheme={statusColorScheme[operator.status] || 'gray'}>
            <Text as="span" color={String(operator.status).toUpperCase() === 'INACTIVE' ? 'red.500' : 'inherit'}>
              {String(operator.status).toUpperCase() === 'ACTIVE' ? '启用' : '停用'}
            </Text>
          </Badge>
        ),
      },
      {
        header: '创建时间',
        render: (operator) => operator.createdAt || '—',
        visible: false,
      },
      {
        header: '最后登录',
        render: (operator) => operator.lastLoginAt || '—',
      },
      {
        header: '操作',
        align: 'right',
        render: (operator) => (
          <Flex justify="flex-end" gap={2}>
            <Tooltip label="查看全部信息" hasArrow>
              <IconButton aria-label="查看全部信息" icon={<FiSearch />} size="sm" variant="ghost" onClick={() => handleOpenDetail(operator)} />
            </Tooltip>
            <Tooltip label="编辑信息" hasArrow>
              <IconButton aria-label="编辑信息" icon={<FiEdit2 />} size="sm" variant="ghost" onClick={() => handleOpenEdit(operator)} />
            </Tooltip>
          </Flex>
        ),
      },
    ],
    [statusColorScheme, handleOpenDetail, handleOpenEdit, mutedText]
  );

  const handleUpdate = async () => {
    if (!editFormData.name.trim() || !editFormData.loginName.trim()) return;
    setIsUpdating(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    try {
      const payload = await updateOperator({
        id: editFormData.id,
        data: {
          operatorNo: editFormData.operatorNo || editFormData.code,
          name: editFormData.name,
          loginName: editFormData.loginName,
          phone: editFormData.phone,
          email: editFormData.email || undefined,
          roleId: Number(editFormData.roleId) || editFormData.roleId,
        },
        signal: controller.signal,
      });
      const updated = payload?.data && typeof payload.data === 'object' ? payload.data : payload && typeof payload === 'object' ? payload : null;
      const merged = updated ? { ...editFormData, ...updated } : editFormData;
      const roleInfo = rolesOptions.find((r) => r.id === (merged.roleId || merged.role_id));
      const mergedWithRoleName = { ...merged, roleName: merged.roleName || roleInfo?.name };

      setOperators((prev) => prev.map((op) => (op.id === editFormData.id ? { ...op, ...mergedWithRoleName } : op)));
      onEditClose();
      toast({
        title: '操作员更新成功',
        status: 'success',
        position: 'top',
        duration: 2500,
        isClosable: true,
      });
    } catch (error) {
      console.warn('更新操作员失败：', error);
      toast({
        title: '更新操作员失败',
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

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">操作员管理</Heading>
        <Button leftIcon={<FiPlus />} colorScheme="teal" onClick={handleOpenAdd}>
          新建操作员
        </Button>
      </Flex>

      <DataTable columns={columns} data={operators} rowKey={(item) => item.id || item.code} pagination={{ currentPage, totalPages, onPageChange: handlePageChange }} />

      <Modal isOpen={isAddOpen} onClose={onAddClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>新建操作员</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6} maxH="75vh" overflowY="auto">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel>操作员编号</FormLabel>
                <Input name="operatorNo" placeholder="" value={formData.operatorNo} onChange={handleInputChange} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>操作员姓名</FormLabel>
                <Input name="name" value={formData.name} onChange={handleInputChange} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>登录名</FormLabel>
                <Input name="loginName" value={formData.loginName} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>登录密码</FormLabel>
                <Input name="loginPassword" type="password" value={formData.loginPassword} onChange={handleInputChange} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>联系电话</FormLabel>
                <Input name="phone" value={formData.phone} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>电子邮箱</FormLabel>
                <Input name="email" value={formData.email} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>所属角色</FormLabel>
                <Select name="roleId" value={formData.roleId} onChange={handleInputChange}>
                  {rolesOptions.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>状态</FormLabel>
                <Select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="active">启用</option>
                  <option value="inactive">停用</option>
                </Select>
              </FormControl>
            </SimpleGrid>
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

      <Modal isOpen={isEditOpen} onClose={onEditClose} isCentered size="5xl">
        <ModalOverlay />
        <ModalContent maxW="960px" w="90vw">
          <ModalHeader>编辑操作员</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6} maxH="80vh" overflowY="auto">
            <Flex direction={{ base: 'column', md: 'row' }} gap={6} wrap="wrap" mb={4}>
              <Text>
                操作员编号：
                <Text as="span" fontWeight="semibold">
                  {editFormData.operatorNo || '—'}
                </Text>
              </Text>
              <Text>
                操作员姓名：
                <Text as="span" fontWeight="semibold">
                  {editFormData.name || '—'}
                </Text>
              </Text>
              <Text>
                登录名：
                <Text as="span" fontWeight="semibold">
                  {editFormData.loginName || '—'}
                </Text>
              </Text>
            </Flex>
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
              <FormControl>
                <FormLabel>联系电话</FormLabel>
                <Input name="phone" value={editFormData.phone} onChange={handleEditInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>电子邮箱</FormLabel>
                <Input name="email" value={editFormData.email} onChange={handleEditInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>所属角色</FormLabel>
                <Select name="roleId" value={editFormData.roleId} onChange={handleEditInputChange}>
                  {rolesOptions.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>状态</FormLabel>
                <Select name="status" value={editFormData.status} onChange={handleEditInputChange}>
                  <option value="active">启用</option>
                  <option value="inactive">停用</option>
                </Select>
              </FormControl>
            </SimpleGrid>
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

      <AlertDialog isOpen={isDetailOpen} onClose={onDetailClose} isCentered>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            操作员信息
          </AlertDialogHeader>
          <AlertDialogBody>
            <Box fontSize="sm" color={mutedText} display="grid" gridTemplateColumns="120px 1fr" rowGap={2} columnGap={3}>
              <Text>编号</Text>
              <Text color="inherit">{detailTarget?.code || detailTarget?.id || '—'}</Text>
              <Text>姓名</Text>
              <Text color="inherit">{detailTarget?.name || '—'}</Text>
              <Text>登录名</Text>
              <Text color="inherit">{detailTarget?.loginName || '—'}</Text>
              <Text>联系电话</Text>
              <Text color="inherit">{detailTarget?.phone || '—'}</Text>
              <Text>电子邮箱</Text>
              <Text color="inherit">{detailTarget?.email || '—'}</Text>
              <Text>所属角色</Text>
              <Text color="inherit">{detailTarget?.roleName || '—'}</Text>
              <Text>状态</Text>
              <Text color="inherit">{detailTarget?.status === 'active' ? '启用' : '停用'}</Text>
              <Text>创建时间</Text>
              <Text color="inherit">{detailTarget?.createdAt || '—'}</Text>
              <Text>最后登录</Text>
              <Text color="inherit">{detailTarget?.lastLoginAt || '—'}</Text>
            </Box>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button onClick={onDetailClose}>关闭</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
};

export default OperatorsPage;
