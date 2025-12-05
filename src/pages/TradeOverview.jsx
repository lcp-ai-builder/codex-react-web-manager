import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { fetchRecentHourTradeSummary } from '@/services/trade-service.js';

const formatTime = (timestamp) => {
  if (!timestamp) return '-';
  const parsed = Number(timestamp);
  const date = new Date(parsed);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
};

const toNumber = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const TradeOverviewPage = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const subtleText = useColorModeValue('gray.600', 'gray.300');
  const accent = useColorModeValue('teal.600', 'teal.200');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchRecentHourTradeSummary();
      setSummary({
        count: toNumber(data?.count),
        totalAmount: toNumber(data?.totalAmount),
        windowStart: data?.windowStart,
        windowEnd: data?.windowEnd,
        fallback: Boolean(data?.fallback),
      });
    } catch (err) {
      setError(err.message || '加载失败');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const windowText = useMemo(() => {
    if (!summary) return '-';
    return `${formatTime(summary.windowStart)} ~ ${formatTime(summary.windowEnd)}`;
  }, [summary]);

  return (
    <Flex direction="column" gap={4}>
      <Flex justify="space-between" align="center">
        <Heading size="lg">交易概览</Heading>
        <Button size="sm" colorScheme="teal" onClick={loadSummary} isLoading={loading}>
          刷新
        </Button>
      </Flex>

      {error && (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}

      <Box bg={cardBg} borderRadius="lg" border="1px solid" borderColor={borderColor} p={6} boxShadow="sm">
        <Flex justify="space-between" align={{ base: 'stretch', md: 'center' }} gap={6} direction={{ base: 'column', md: 'row' }}>
          <Box>
            <Text fontSize="sm" color={subtleText} mb={1}>
              统计时间窗口
            </Text>
            <Text fontWeight="semibold">{windowText}</Text>
            {summary?.fallback && (
              <Text mt={2} fontSize="sm" color="orange.400">
                最近一小时无数据，已回退到最近有数据的1小时区间
              </Text>
            )}
          </Box>
          <Flex gap={6} flexWrap="wrap">
            <Stat minW="180px">
              <StatLabel>交易笔数</StatLabel>
              <StatNumber color={accent}>
                {loading ? <Spinner size="sm" /> : summary?.count ?? '--'}
              </StatNumber>
              <StatHelpText color={subtleText}>最近一小时内的成交总笔数</StatHelpText>
            </Stat>
            <Stat minW="220px">
              <StatLabel>总交易金额</StatLabel>
              <StatNumber color={accent}>
                {loading ? <Spinner size="sm" /> : summary ? summary.totalAmount.toLocaleString() : '--'}
              </StatNumber>
              <StatHelpText color={subtleText}>包含手续费在内的成交总额</StatHelpText>
            </Stat>
          </Flex>
        </Flex>
      </Box>
    </Flex>
  );
};

export default TradeOverviewPage;
