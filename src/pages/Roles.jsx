/**
 * 角色管理页面组件
 * 
 * 功能说明：
 * - 管理系统角色的增删改查
 * - 支持角色启用/停用状态切换
 * - 支持分页查询角色列表
 * - 支持编辑角色信息（名称、标识、描述）
 * 
 * 权限要求：
 * - 需要系统管理权限（/home/system）
 * - 只有管理员可以访问
 */
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

// 分页大小常量
const PAGE_SIZE = 10;

// 状态颜色配置：启用状态显示绿色，停用状态显示灰色
const statusColorScheme = {
  open: 'green',
  closed: 'gray',
};

const RolesPage = () => {
  const toast = useToast();

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

  // ==================== 工具函数 ====================
  /**
   * 规范化启用状态值
   * 用途：将各种可能的状态值统一转换为 1（启用）或 0（停用）
   * @param {any} value - 原始状态值
   * @returns {number} 1 表示启用，0 表示停用
   */
  const normalizeIsOpen = (value) => (Number(value) === 1 ? 1 : 0);

  // ==================== 事件处理函数 ====================
  /**
   * 处理分页切换
   * 用途：用户点击分页按钮时，加载对应页面的角色数据
   * @param {number} nextPage - 目标页码
   */
  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    loadPage(nextPage);
  };

  /**
   * 处理新建表单输入变化
   * 用途：实时更新新建角色表单的数据
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
   * 用途：实时更新编辑角色表单的数据
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
   * 打开新建角色弹窗
   * 用途：重置表单数据并打开新建弹窗，确保每次打开都是干净的表单
   */
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      isOpen: 1,
    });
    onAddOpen();
  };

  /**
   * 保存新建的角色
   * 用途：提交新建角色表单，创建新的角色
   * 流程：
   * 1. 表单验证（必填项、角色标识格式）
   * 2. 发送创建请求到后端
   * 3. 成功后更新本地列表并显示成功提示
   * 4. 失败时显示错误提示
   * 超时处理：3秒无响应自动取消请求
   */
  const handleSave = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      toast({
        title: '请填写必填项',
        status: 'warning',
        position: 'top',
        duration: 2500,
        isClosable: true,
      });
      return;
    }
    // 角色标识格式验证（只允许字母、数字、下划线、连字符）
    const codeRegex = /^[a-zA-Z0-9_-]+$/;
    if (!codeRegex.test(formData.code.trim())) {
      toast({
        title: '角色标识只能包含字母、数字、下划线和连字符',
        status: 'warning',
        position: 'top',
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    const payloadData = { ...formData, isOpen: normalizeIsOpen(formData.isOpen) };
    setIsSaving(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const payload = await createRole({ data: payloadData, signal: controller.signal });
      // 检查请求是否已被取消
      if (controller.signal.aborted) {
        return;
      }

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
      // 如果请求被取消，不显示错误提示
      if (controller.signal.aborted && error.name === 'AbortError') {
        return;
      }
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

  /**
   * 打开编辑角色弹窗
   * 用途：点击编辑按钮时，将选中角色的数据填充到编辑表单
   * @param {Object} role - 要编辑的角色对象
   */
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

  /**
   * 更新角色信息
   * 用途：提交编辑表单，更新角色的基本信息
   * 流程：
   * 1. 表单验证（必填项、角色标识格式）
   * 2. 发送更新请求到后端
   * 3. 成功后更新本地列表并显示成功提示
   * 4. 失败时显示错误提示
   * 可编辑字段：名称、标识、描述
   * 超时处理：3秒无响应自动取消请求
   */
  const handleUpdate = async () => {
    if (!editFormData.name.trim() || !editFormData.code.trim()) {
      toast({
        title: '请填写必填项',
        status: 'warning',
        position: 'top',
        duration: 2500,
        isClosable: true,
      });
      return;
    }
    // 角色标识格式验证
    const codeRegex = /^[a-zA-Z0-9_-]+$/;
    if (!codeRegex.test(editFormData.code.trim())) {
      toast({
        title: '角色标识只能包含字母、数字、下划线和连字符',
        status: 'warning',
        position: 'top',
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    setIsUpdating(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    try {
      const payload = await updateRole({
        id: editFormData.id,
        data: editFormData,
        signal: controller.signal,
      });
      // 检查请求是否已被取消
      if (controller.signal.aborted) {
        return;
      }

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
      // 如果请求被取消，不显示错误提示
      if (controller.signal.aborted && error.name === 'AbortError') {
        return;
      }
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

  /**
   * 切换角色启用/停用状态
   * 用途：点击状态开关时，弹出确认对话框
   * 逻辑：根据当前状态计算目标状态（启用变停用，停用变启用）
   * @param {Object} role - 要切换状态的角色对象
   */
  const handleToggleStatus = useCallback((role) => {
    const active = isOpenEnabled(role.isOpen ?? role.status);
    const nextIsOpen = active ? 0 : 1;
    setStatusConfirm({ isOpen: true, role, nextIsOpen });
  }, []);

  /**
   * 关闭状态确认对话框
   * 用途：取消状态切换操作，重置确认对话框状态
   */
  const closeStatusConfirm = () => setStatusConfirm({ isOpen: false, role: null, nextIsOpen: 1 });

  /**
   * 确认并执行状态切换
   * 用途：在确认对话框中点击确认后，调用后端接口更新角色状态
   * 流程：
   * 1. 发送状态更新请求
   * 2. 成功后更新本地列表中的角色状态
   * 3. 显示成功提示并关闭确认对话框
   * 超时处理：3秒无响应自动取消请求
   */
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
      // 检查请求是否已被取消
      if (controller.signal.aborted) {
        return;
      }
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
      // 如果请求被取消，不显示错误提示
      if (controller.signal.aborted && error.name === 'AbortError') {
        return;
      }
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
