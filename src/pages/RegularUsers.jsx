import { useRef, useState } from 'react';
// prettier-ignore
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Badge, Box, Button, Flex, FormControl, FormLabel, Heading, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, useColorModeValue, useDisclosure, useToast, IconButton, HStack } from '@chakra-ui/react';
// prettier-ignore
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import Pagination from '@/components/Pagination.jsx';
import { regularUsersData } from '@/data/regularUsers.js';
import { fetchUsers as fetchUsersApi, addUser, updateUser, deleteUser } from '@/services/api-services.js';
import usePagedList from '@/hooks/usePagedList.js';
import { isStatusActive } from '@/utils/status.js';

const PAGE_SIZE = 10; // 统一设置分页大小，方便后续联动

const RegularUsersPage = () => {
  // 通过通用分页 Hook 管理列表和分页信息，接口不可用时自动回退到本地 mock 数据
  const {
    items: users,
    setItems: setUsers,
    currentPage,
    setCurrentPage,
    totalItems,
    setTotalItems,
    totalPages,
    loading,
    loadPage,
  } = usePagedList({
    pageSize: PAGE_SIZE,
    initialData: regularUsersData,
    fetchPage: ({ page, pageSize, signal }) =>
      fetchUsersApi({
        page,
        pageSize,
        signal,
      }),
    onError: (error, { page }) => {
      console.log('获取用户列表失败：', error);
      toast({
        title: '获取用户列表失败',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      // 首次加载失败时 Hook 会自动回退到本地 mock，这里只需处理提示
      if (page === 1) {
        return;
      }
    },
  });
  // 表单仅用于演示添加用户的结构，不会真的写入 mock 数据
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    status: 'active',
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    status: 'active',
  });
  // 当前被编辑或删除的那条记录
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  // 控制加载状态，方便按钮展示转圈
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isSuccessOpen, onOpen: onSuccessOpen, onClose: onSuccessClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const successCancelRef = useRef();
  const deleteCancelRef = useRef();
  const toast = useToast();

  const tableBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const mutedText = useColorModeValue('gray.600', 'gray.400');

  // 切换分页时访问正式接口
  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    loadPage(nextPage);
  };

  // 实时收集表单输入
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 打开弹窗前重置表单，保持体验一致
  const handleOpenModal = () => {
    setFormData({
      name: '',
      email: '',
      status: 'active',
    });
    onAddOpen();
  };

  // 保存数据：调用 /addNewUser 接口，并在 3 秒内无响应时给出提示
  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) return;
    setIsSaving(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    try {
      await addUser({ data: formData, signal: controller.signal });
      onAddClose();
      // 新用户成功添加后，前端可选择刷新列表；这里简单地插入一条在顶部
      setUsers((prev) => [
        {
          id: `U${String(prev.length + 1).padStart(3, '0')}`,
          ...formData,
          joinedAt: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ]);
      onSuccessOpen();
    } catch {
      toast({
        title: 'api无法访问',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      clearTimeout(timeoutId);
      setIsSaving(false);
    }
  };

  // 根据状态展示不同颜色的 Badge
  const renderStatus = (status) => {
    const active = isStatusActive(status);
    return (
      <Badge colorScheme={active ? 'teal' : 'orange'} variant="subtle">
        {active ? '启用' : '停用'}
      </Badge>
    );
  };

  return (
    <Box p={{ base: 4, md: 8 }}>
      {/* <Heading size="lg" mb={6}>
        普通用户
      </Heading> */}
      <Box bg={tableBg} borderRadius="lg" border="1px solid" borderColor={borderColor} boxShadow="sm">
        {/* 表格头部：仅放一个“添加”按钮 */}
        <Flex px={6} py={4} borderBottom="1px solid" borderColor={borderColor} align="center" justify="flex-start">
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
                <Th textAlign="center">操作</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => (
                <Tr key={user.id}>
                  <Td>{user.id}</Td>
                  <Td>{user.name}</Td>
                  <Td>{user.email}</Td>
                  <Td>{renderStatus(user.status)}</Td>
                  <Td isNumeric>{user.joinedAt}</Td>
                  <Td>
                    <HStack justify="center" spacing={2}>
                      <IconButton
                        aria-label="编辑"
                        icon={<FiEdit2 />}
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          // 进入编辑模式前缓存当前行数据
                          setSelectedUser(user);
                          setEditFormData({
                            name: user.name,
                            email: user.email,
                            status: user.status,
                          });
                          onEditOpen();
                        }}
                      />
                      <IconButton
                        aria-label="删除"
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => {
                          // 删除也需要记录目标，稍后在确认框中使用
                          setDeleteTarget(user);
                          onDeleteOpen();
                        }}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
        <Flex align="center" justify="space-between" px={6} py={4} borderTop="1px solid" borderColor={borderColor} flexWrap="wrap" gap={4}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            colorScheme="teal"
            isLoading={loading}
          />
        </Flex>
      </Box>
      {/* 新增用户弹窗：三项基础信息 */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>添加新用户</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>姓名</FormLabel>
              <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="请输入用户姓名" />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>邮箱</FormLabel>
              <Input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="user@example.com" />
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
      {/* 编辑用户弹窗 */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>编辑用户信息</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>姓名</FormLabel>
              <Input
                name="name"
                value={editFormData.name}
                onChange={(event) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    [event.target.name]: event.target.value,
                  }))
                }
                placeholder="请输入用户姓名"
              />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>邮箱</FormLabel>
              <Input
                name="email"
                type="email"
                value={editFormData.email}
                onChange={(event) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    [event.target.name]: event.target.value,
                  }))
                }
                placeholder="user@example.com"
              />
            </FormControl>
            <FormControl>
              <FormLabel>状态</FormLabel>
              <Select
                name="status"
                value={editFormData.status}
                onChange={(event) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    [event.target.name]: event.target.value,
                  }))
                }
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
              onClick={async () => {
                if (!selectedUser) return;
                setIsUpdating(true);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);
                try {
                  await updateUser({
                    id: selectedUser.id,
                    data: editFormData,
                    signal: controller.signal,
                  });
                  // 同步更新本地 users，保持列表与接口一致
                  setUsers((prev) => prev.map((user) => (user.id === selectedUser.id ? { ...user, ...editFormData } : user)));
                  toast({
                    title: '用户已更新',
                    status: 'success',
                    duration: 2000,
                    isClosable: true,
                  });
                  onEditClose();
                } catch (error) {
                  toast({
                    title: '更新失败',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                  });
                } finally {
                  clearTimeout(timeoutId);
                  setIsUpdating(false);
                }
              }}
              isLoading={isUpdating}
            >
              更新
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* 新增完成提示框 */}
      <AlertDialog isOpen={isSuccessOpen} leastDestructiveRef={successCancelRef} onClose={onSuccessClose} isCentered>
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
      {/* 删除确认框 */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={deleteCancelRef}
        onClose={() => {
          setDeleteTarget(null);
          onDeleteClose();
        }}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              确认删除
            </AlertDialogHeader>
            <AlertDialogBody>{deleteTarget ? `确定要删除用户 ${deleteTarget.name} 吗？该操作不可撤销。` : '确定要删除该用户吗？'}</AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={deleteCancelRef}
                onClick={() => {
                  // 取消时重置目标，避免下次误用
                  setDeleteTarget(null);
                  onDeleteClose();
                }}
              >
                取消
              </Button>
              <Button
                colorScheme="red"
                ml={3}
                isLoading={isDeleting}
                onClick={async () => {
                  if (!deleteTarget) return;
                  setIsDeleting(true);
                  const controller = new AbortController();
                  try {
                    await deleteUser({
                      id: deleteTarget.id,
                      signal: controller.signal,
                    });
                    setUsers((prev) => {
                      const updated = prev.filter((user) => user.id !== deleteTarget.id);
                      // 删除后若总页数减少，回退到最后一页，避免空白页
                      const newTotalPages = Math.max(1, Math.ceil(updated.length / PAGE_SIZE));
                      if (currentPage > newTotalPages) {
                        setCurrentPage(newTotalPages);
                      }
                      return updated;
                    });
                    toast({
                      title: '用户已删除',
                      status: 'success',
                      duration: 2000,
                      isClosable: true,
                    });
                    setDeleteTarget(null);
                    onDeleteClose();
                  } catch (error) {
                    toast({
                      title: '删除失败',
                      status: 'error',
                      duration: 3000,
                      isClosable: true,
                    });
                  } finally {
                    setIsDeleting(false);
                  }
                }}
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

export default RegularUsersPage;
