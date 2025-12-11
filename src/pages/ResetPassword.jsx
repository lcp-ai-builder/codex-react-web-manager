import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Flex, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure, useToast } from '@chakra-ui/react';
import { FiKey, FiRefreshCcw } from 'react-icons/fi';
import DataTable from '@/components/DataTable.jsx';
import { fetchOperators, resetOperatorPassword } from '@/services/manager-service.js';
import { hashPassword } from '@/components/hash-password';

const ResetPasswordPage = () => {
  const toast = useToast();
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [resetTarget, setResetTarget] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const loadOperators = async () => {
    setLoading(true);
    try {
      const data = await fetchOperators({ page: 1, pageSize: 100 });
      const list = Array.isArray(data?.records) ? data.records : [];
      setOperators(
        list.map((op) => ({
          ...op,
          loginName: op.loginName || op.login_name || '',
          operatorNo: op.operatorNo || op.operator_no || '',
        }))
      );
    } catch (err) {
      toast({
        title: '加载操作员失败',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOperators();
  }, []);

  const columns = useMemo(
    () => [
      { header: '操作员编号', dataKey: 'operatorNo', render: (op) => op.operatorNo || '—' },
      { header: '姓名', dataKey: 'name', render: (op) => op.name || '—' },
      { header: '登录名', dataKey: 'loginName', render: (op) => op.loginName || '—' },
      {
        header: '操作',
        dataKey: 'actions',
        render: (op) => (
          <IconButton
            aria-label="重置密码"
            icon={<FiRefreshCcw />}
            size="sm"
            variant="ghost"
            title="重置密码"
            onClick={() => {
              setResetTarget(op);
              setPassword1('');
              setPassword2('');
              onOpen();
            }}
          />
        ),
      },
    ],
    [onOpen]
  );

  const handleReset = async () => {
    if (!resetTarget) return;
    if (!password1 || !password2) {
      toast({ title: '请输入密码', status: 'error', duration: 2000, isClosable: true, position: 'top' });
      return;
    }
    if (password1 !== password2) {
      toast({ title: '两次输入的密码不一致', status: 'error', duration: 2000, isClosable: true, position: 'top' });
      return;
    }
    try {
      const hashed = await hashPassword(password1);
      const res = await resetOperatorPassword({
        operatorId: resetTarget.id,
        loginInfoId: resetTarget.loginInfoId || resetTarget.login_info_id || null,
        password: hashed,
      });
      if (res?.success) {
        toast({ title: '重置密码成功', status: 'success', duration: 2000, isClosable: true, position: 'top' });
        onClose();
        setResetTarget(null);
        setPassword1('');
        setPassword2('');
      } else {
        toast({ title: res?.message || '重置密码失败', status: 'error', duration: 2000, isClosable: true, position: 'top' });
      }
    } catch (err) {
      toast({ title: err?.payload?.message || '重置密码失败', status: 'error', duration: 2000, isClosable: true, position: 'top' });
    }
  };

  return (
    <Box>
      <Flex align="center" gap={2} mb={4}>
        <FiKey />
        <Text fontSize="xl" fontWeight="bold">
          修改密码
        </Text>
      </Flex>
      <DataTable columns={columns} data={operators} loading={loading} />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>重置密码</ModalHeader>
          <ModalCloseButton />
          <ModalBody display="grid" rowGap={3}>
            <Text>操作员：{resetTarget?.name || '—'}</Text>
            <Input placeholder="请输入新密码" type="password" value={password1} onChange={(e) => setPassword1(e.target.value)} />
            <Input placeholder="请再次输入新密码" type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} />
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              取消
            </Button>
            <Button colorScheme="teal" onClick={handleReset}>
              确定
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ResetPasswordPage;
