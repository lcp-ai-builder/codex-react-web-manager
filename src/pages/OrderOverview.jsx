import { useMemo } from 'react';
import { Box, Flex, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import { ResponsiveBar } from '@nivo/bar';
import { last10DaysOrders } from '@/data/orderOverview.js';

const OrderOverviewPage = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const axisColor = useColorModeValue('#334155', '#cbd5e1');
  const gridColor = useColorModeValue('#e2e8f0', '#475569');
  const barColor = useColorModeValue('#0f766e', '#2dd4bf');

  const chartData = useMemo(() => last10DaysOrders.map((item) => ({ day: item.day, value: item.value })), []);

  const peak = Math.max(...last10DaysOrders.map((d) => d.value), 0);
  const avg = Math.round(last10DaysOrders.reduce((sum, cur) => sum + cur.value, 0) / last10DaysOrders.length);

  return (
    <Flex direction="column" gap={6}>
      <Heading size="lg">订单概览</Heading>
      <Box bg={cardBg} borderRadius="lg" boxShadow="sm" p={6} w={{ base: '100%', md: '40%' }}>
        <Heading size="md" mb={4}>
          最近10天的订单量
        </Heading>
        <Box h="320px">
          <ResponsiveBar
            data={chartData}
            keys={['value']}
            indexBy="day"
            margin={{ top: 24, right: 24, bottom: 48, left: 44 }}
            padding={0.2}
            colors={[barColor]}
            enableLabel
            labelTextColor={axisColor}
            borderRadius={4}
            axisBottom={{
              tickSize: 0,
              tickPadding: 10,
              legend: '',
              legendOffset: 32,
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 8,
              tickValues: 5,
              legend: '订单量',
              legendOffset: -36,
              legendPosition: 'middle',
            }}
            enableGridY
            gridYValues={5}
            theme={{
              textColor: axisColor,
              axis: {
                domain: { line: { stroke: axisColor, strokeWidth: 1 } },
                ticks: { line: { stroke: axisColor, strokeWidth: 1 }, text: { fill: axisColor } },
              },
              grid: { line: { stroke: gridColor, strokeWidth: 1, strokeDasharray: '4 4' } },
              tooltip: { container: { background: cardBg, color: axisColor } },
            }}
          />
        </Box>
        <Text mt={3} fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
          峰值：{peak} 单 / 平均：{avg} 单
        </Text>
      </Box>
    </Flex>
  );
};

export default OrderOverviewPage;
