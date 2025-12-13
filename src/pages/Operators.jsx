/**
 * 操作员管理页面组件
 * 
 * 功能说明：
 * - 管理系统操作员账号的增删改查
 * - 支持操作员启用/停用状态切换
 * - 支持分页查询操作员列表
 * - 支持查看操作员详细信息
 * - 支持编辑操作员基本信息（电话、邮箱、角色等）
 * 
 * 权限要求：
 * - 需要系统管理权限（/home/system）
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  FormControl,
  FormLabel,
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
  Switch,
} from '@chakra-ui/react';
import { FiEdit2, FiPlus, FiSearch, FiUserCheck } from 'react-icons/fi';
import DataTable from '@/components/DataTable.jsx';
import { fetchOperators, createOperator, updateOperator, fetchRoles as fetchRolesApi, updateOperatorIsOpen } from '@/services/manager-service.js';
import usePagedList from '@/hooks/usePagedList.js';
import { isOpenEnabled } from '@/utils/status.js';

// 分页大小常量
const PAGE_SIZE = 10;

// 状态颜色配置：启用状态显示绿色，停用状态显示灰色
const statusColorScheme = {
  open: 'green',
  closed: 'gray',
};

const OperatorsPage = () => {
  const toast = useToast();

  const {
    items: operators,
    setItems: setOperators,
    currentPage,
    setTotalItems,
    totalPages,
    loading,
    loadPage,
  } = usePagedList({
    pageSize: PAGE_SIZE,
    initialData: [],
    fetchPage: ({ page, pageSize, signal }) =>
      fetchOperators({
        page,
        pageSize,
        signal,
      }),
    onError: (error, { page }) => {
      console.warn('获取操作员列表失败：', error);
      toast({
        title: '获取操作员列表失败',
        status: 'error',
        position: 'top',
        duration: 3000,
        isClosable: true,
      });
      if (page === 1) return;
    },
  });
  const [rolesOptions, setRolesOptions] = useState([]);
  const [formData, setFormData] = useState({
    operatorNo: '',
    name: '',
    loginName: '',
    phone: '',
    roleId: rolesOptions[0]?.id || '',
    isOpen: 1,
  });
  const [editFormData, setEditFormData] = useState({
    id: '',
    operatorNo: '',
    name: '',
    loginName: '',
    phone: '',
    email: '',
    roleId: rolesOptions[0]?.id || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [detailTarget, setDetailTarget] = useState(null);
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const [statusConfirm, setStatusConfirm] = useState({ isOpen: false, operator: null, nextIsOpen: 1 });
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const mutedText = useColorModeValue('gray.600', 'gray.400');

  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  // ==================== 工具函数 ====================
  /**
   * 规范化启用状态值
   * 用途：将各种可能的状态值统一转换为 1（启用）或 0（停用）
   * @param {any} value - 原始状态值
   * @returns {number} 1 表示启用，0 表示停用
   */
  const normalizeIsOpen = (value) => (Number(value) === 1 ? 1 : 0);

  // ==================== 数据获取函数 ====================
  /**
   * 获取角色选项列表
   * 用途：从后端获取所有角色，用于操作员表单中的角色下拉选择框
   * 处理：兼容多种后端响应格式，统一转换为标准格式
   * 错误处理：获取失败时设置为空数组，不影响页面正常显示
   */
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
      const list = (listCandidate.length ? listCandidate : []).map((role, idx) => ({
        ...role,
        id: typeof role.id === 'number' ? role.id : Number(role.id) || idx + 1,
      }));
      setRolesOptions(list);
    } catch (error) {
      console.warn('获取角色选项失败：', error);
      setRolesOptions([]);
    }
  }, []);

  // ==================== 副作用处理 ====================
  /**
   * 组件挂载时获取角色选项
   * 依赖：fetchRolesOptions（使用 useCallback 包装，避免无限循环）
   */
  useEffect(() => {
    fetchRolesOptions();
  }, [fetchRolesOptions]);

  /**
   * 当角色选项加载完成后，自动设置表单默认角色
   * 用途：确保新建和编辑表单都有默认选中的角色
   * 逻辑：如果表单中还没有选择角色，则自动选择第一个角色
   */
  useEffect(() => {
    if (!rolesOptions[0]?.id) return;
    setFormData((prev) => (prev.roleId ? prev : { ...prev, roleId: rolesOptions[0].id }));
    setEditFormData((prev) => (prev.roleId ? prev : { ...prev, roleId: rolesOptions[0].id }));
  }, [rolesOptions]);

  // ==================== 事件处理函数 ====================
  /**
   * 处理分页切换
   * 用途：用户点击分页按钮时，加载对应页面的数据
   * @param {number} nextPage - 目标页码
   */
  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    loadPage(nextPage);
  };

  /**
   * 处理新建表单输入变化
   * 用途：实时更新新建操作员表单的数据
   * 特殊处理：isOpen 字段需要转换为数字类型
   * @param {Event} event - 输入事件对象
   */
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === 'isOpen' ? Number(value) : value;
    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  /**
   * 处理编辑表单输入变化
   * 用途：实时更新编辑操作员表单的数据
   * @param {Event} event - 输入事件对象
   */
  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * 打开新建操作员弹窗
   * 用途：重置表单数据并打开新建弹窗
   * 自动生成：操作员编号自动生成（基于时间戳）
   */
  const handleOpenAdd = () => {
    setFormData({
      operatorNo: `OP${String(Date.now()).slice(-5)}`,
      name: '',
      loginName: '',
      loginPassword: '',
      phone: '',
      email: '',
      roleId: rolesOptions[0]?.id || '',
      isOpen: 1,
    });
    onAddOpen();
  };

  /**
   * 保存新建的操作员
   * 用途：提交新建操作员表单，创建新的操作员账号
   * 流程：
   * 1. 表单验证（必填项、电话格式、邮箱格式）
   * 2. 发送创建请求到后端
   * 3. 成功后更新本地列表并显示成功提示
   * 4. 失败时显示错误提示
   * 超时处理：3秒无响应自动取消请求
   */
  const handleSave = async () => {
    const roleIdValue = formData.roleId ?? '';
    // 步骤1：必填项验证
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
    // 电话格式验证（简单验证：至少包含数字）
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(formData.phone.trim()) || formData.phone.trim().length < 6) {
      toast({
        title: '请输入有效的电话号码',
        status: 'warning',
        position: 'top',
        duration: 2500,
        isClosable: true,
      });
      return;
    }
    // 邮箱格式验证（如果填写了邮箱）
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        toast({
          title: '请输入有效的邮箱地址',
          status: 'warning',
          position: 'top',
          duration: 2500,
          isClosable: true,
        });
        return;
      }
    }

    setIsSaving(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const payload = await createOperator({
        data: {
          operatorNo: formData.operatorNo,
          name: formData.name,
          loginName: formData.loginName,
          phone: formData.phone,
          roleId: Number(formData.roleId) || formData.roleId,
          ...(formData.email ? { email: formData.email } : {}),
          isOpen: normalizeIsOpen(formData.isOpen),
        },
        signal: controller.signal,
      });
      // 检查请求是否已被取消
      if (controller.signal.aborted) {
        return;
      }
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
              isOpen: normalizeIsOpen(formData.isOpen),
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
      // 如果请求被取消，不显示错误提示
      if (controller.signal.aborted && error.name === 'AbortError') {
        return;
      }
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

  /**
   * 打开编辑操作员弹窗
   * 用途：点击编辑按钮时，将选中操作员的数据填充到编辑表单
   * 处理：兼容多种字段名称（operatorNo/operator_no/code），自动匹配角色ID
   * @param {Object} operator - 要编辑的操作员对象
   */
  const handleOpenEdit = useCallback(
    (operator) => {
      setEditFormData({
        id: operator.id,
        operatorNo: operator.operatorNo || operator.operator_no || operator.code || '',
        name: operator.name || '',
        loginName: operator.loginName || '',
        phone: operator.phone || '',
        email: operator.email || '',
        roleId: operator.roleId || operator.role_id || rolesOptions.find((r) => r.name === operator.roleName)?.id || rolesOptions[0]?.id || '',
      });
      onEditOpen();
    },
    [onEditOpen, rolesOptions]
  );

  /**
   * 打开操作员详情弹窗
   * 用途：点击查看按钮时，显示操作员的完整信息
   * @param {Object} operator - 要查看的操作员对象
   */
  const handleOpenDetail = useCallback(
    (operator) => {
      setDetailTarget(operator);
      onDetailOpen();
    },
    [onDetailOpen]
  );

  /**
   * 切换操作员启用/停用状态
   * 用途：点击状态开关时，弹出确认对话框
   * 逻辑：根据当前状态计算目标状态（启用变停用，停用变启用）
   * @param {Object} operator - 要切换状态的操作员对象
   */
  const handleToggleStatus = (operator) => {
    const active = isOpenEnabled(operator.isOpen ?? operator.status ?? 1);
    const nextIsOpen = active ? 0 : 1;
    setStatusConfirm({ isOpen: true, operator, nextIsOpen });
  };

  /**
   * 关闭状态确认对话框
   * 用途：取消状态切换操作，重置确认对话框状态
   */
  const closeStatusConfirm = () => setStatusConfirm({ isOpen: false, operator: null, nextIsOpen: 1 });

  /**
   * 确认并执行状态切换
   * 用途：在确认对话框中点击确认后，调用后端接口更新操作员状态
   * 流程：
   * 1. 发送状态更新请求
   * 2. 成功后更新本地列表中的操作员状态
   * 3. 显示成功提示并关闭确认对话框
   * 超时处理：3秒无响应自动取消请求
   */
  const handleConfirmStatus = async () => {
    if (!statusConfirm.operator) return;
    setIsStatusUpdating(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    try {
      const payload = await updateOperatorIsOpen({
        id: statusConfirm.operator.id,
        isOpen: statusConfirm.nextIsOpen,
        signal: controller.signal,
      });
      // 检查请求是否已被取消
      if (controller.signal.aborted) {
        return;
      }
      const returned = payload?.data && typeof payload.data === 'object' ? payload.data : payload && typeof payload === 'object' ? payload : null;
      const merged = returned && typeof returned === 'object' ? { ...statusConfirm.operator, ...returned } : { ...statusConfirm.operator, isOpen: statusConfirm.nextIsOpen };

      setOperators((prev) => prev.map((op) => (op.id === statusConfirm.operator.id ? merged : op)));
      toast({
        title: statusConfirm.nextIsOpen === 1 ? '操作员已启用' : '操作员已停用',
        status: 'success',
        position: 'top',
        duration: 2500,
        isClosable: true,
      });
    } catch (error) {
      // 如果请求被取消，不显示错误提示
      if (controller.signal.aborted && error.name === 'AbortError') {
        return;
      }
      console.warn('更新操作员状态失败：', error);
      toast({
        title: '更新操作员状态失败',
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

  // ==================== 表格列配置 ====================
  /**
   * 数据表格列配置
   * 用途：定义操作员列表表格的列结构、渲染方式和显示逻辑
   * 包含列：
   * - 编号、姓名、登录名、联系电话、电子邮箱、所属角色
   * - 状态、创建时间、最后登录
   * - 启用/停用开关、操作按钮（查看、编辑）
   * 注意：部分列默认隐藏（visible: false），可通过表格配置显示
   */
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
        render: (operator) => {
          const active = isOpenEnabled(operator.isOpen ?? operator.status);
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
        header: '启用/停用',
        render: (operator) => {
          const active = isOpenEnabled(operator.isOpen ?? operator.status);
          return (
            <HStack spacing={2}>
              <Switch isChecked={active} onChange={() => handleToggleStatus(operator)} isDisabled={isStatusUpdating} colorScheme="teal" size="sm" />
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
    [handleOpenDetail, handleOpenEdit, isStatusUpdating, mutedText, rolesOptions]
  );

  /**
   * 更新操作员信息
   * 用途：提交编辑表单，更新操作员的基本信息
   * 流程：
   * 1. 表单验证（必填项、电话格式、邮箱格式）
   * 2. 发送更新请求到后端
   * 3. 成功后更新本地列表并显示成功提示
   * 4. 失败时显示错误提示
   * 可编辑字段：电话、邮箱、角色（编号、姓名、登录名不可编辑）
   * 超时处理：3秒无响应自动取消请求
   */
  const handleUpdate = async () => {
    // 步骤1：必填项验证
    if (!editFormData.name.trim() || !editFormData.loginName.trim()) {
      toast({
        title: '请填写必填项',
        status: 'warning',
        position: 'top',
        duration: 2500,
        isClosable: true,
      });
      return;
    }
    // 电话格式验证
    if (editFormData.phone && editFormData.phone.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(editFormData.phone.trim()) || editFormData.phone.trim().length < 6) {
        toast({
          title: '请输入有效的电话号码',
          status: 'warning',
          position: 'top',
          duration: 2500,
          isClosable: true,
        });
        return;
      }
    }
    // 邮箱格式验证
    if (editFormData.email && editFormData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editFormData.email.trim())) {
        toast({
          title: '请输入有效的邮箱地址',
          status: 'warning',
          position: 'top',
          duration: 2500,
          isClosable: true,
        });
        return;
      }
    }

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
      // 检查请求是否已被取消
      if (controller.signal.aborted) {
        return;
      }
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
      // 如果请求被取消，不显示错误提示
      if (controller.signal.aborted && error.name === 'AbortError') {
        return;
      }
      console.warn('更新操作员失败：', error);
      toast({
        title: '更新操作员失败',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      clearTimeout(timeoutId);
      setIsUpdating(false);
    }
  };

  // ==================== 渲染组件 ====================
  return (
    <Box>
      {/* 操作员列表数据表格 */}
      <DataTable
        columns={columns}
        data={operators}
        rowKey={(item) => item.id || item.code}
        pagination={{ currentPage, totalPages, onPageChange: handlePageChange, isLoading: loading }}
        getRowProps={(operator) => {
          const active = isOpenEnabled(operator.isOpen ?? operator.status);
          return active ? {} : { color: mutedText, opacity: 0.75 };
        }}
        title="操作员管理"
        headerIcon={FiUserCheck}
        addText="新建操作员"
        addIcon={FiPlus}
        onAdd={handleOpenAdd}
      />

      <Modal isOpen={isAddOpen} onClose={onAddClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>新建操作员</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6} maxH="75vh" overflowY="auto">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel>操作员编号</FormLabel>
                <Input name="operatorNo" value={formData.operatorNo} onChange={handleInputChange} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>操作员姓名</FormLabel>
                <Input name="name" value={formData.name} onChange={handleInputChange} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>登录名</FormLabel>
                <Input name="loginName" value={formData.loginName} onChange={handleInputChange} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>联系电话</FormLabel>
                <Input name="phone" value={formData.phone} onChange={handleInputChange} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>所属角色</FormLabel>
                <Select name="roleId" value={formData.roleId} onChange={handleInputChange}>
                  {rolesOptions.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
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
              <Text color="inherit">{isOpenEnabled(detailTarget?.isOpen ?? detailTarget?.status) ? '启用' : '停用'}</Text>
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

      <AlertDialog isOpen={statusConfirm.isOpen} onClose={closeStatusConfirm} isCentered>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            确认{statusConfirm.nextIsOpen === 1 ? '启用' : '停用'}
          </AlertDialogHeader>
          <AlertDialogBody>
            是否将操作员「{statusConfirm.operator?.name || statusConfirm.operator?.loginName}」设置为
            {statusConfirm.nextIsOpen === 1 ? '启用' : '停用'}状态？
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button onClick={closeStatusConfirm}>取消</Button>
            <Button colorScheme="teal" onClick={handleConfirmStatus} ml={3} isLoading={isStatusUpdating}>
              确认
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
};

export default OperatorsPage;
