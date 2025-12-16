/**
 * 仪表盘页面组件
 * 
 * 功能说明：
 * - 展示系统关键指标和统计数据
 * - 提供系统概览信息
 * - 显示最近活动动态
 * 
 * 注意：当前为示例数据，实际项目中应接入后端 API 获取真实数据
 */
import { Box, Flex, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import { ResponsiveLine } from '@nivo/line';
import { useMemo } from 'react';

/**
 * 指标卡片组件
 * 用途：展示单个统计指标，包含标题和数值
 * 
 * @param {string} title - 指标标题（如"今日访问量"）
 * @param {string|number} value - 指标数值（支持格式化字符串，如"1,245"）
 */
const InfoCard = ({ title, value }) => {
  // 主题颜色配置：支持亮色/暗色模式
  const cardBg = useColorModeValue('white', 'gray.800'); // 卡片背景色
  const cardShadow = useColorModeValue('sm', 'dark-lg'); // 卡片阴影
  const labelColor = useColorModeValue('gray.500', 'gray.400'); // 标签文字颜色

  return (
    <Box flex="1" minW="240px" bg={cardBg} borderRadius="lg" boxShadow={cardShadow} p={6}>
      {/* 指标标题 */}
      <Text fontSize="sm" color={labelColor}>
        {title}
      </Text>
      {/* 指标数值：大号加粗显示 */}
      <Text fontSize="3xl" fontWeight="bold" mt={2}>
        {value}
      </Text>
    </Box>
  );
};

/**
 * 仪表盘主页面组件
 */
const DashboardPage = () => {
  // 主题颜色配置
  const infoBg = useColorModeValue('white', 'gray.800'); // 信息卡片背景色
  const textMuted = useColorModeValue('gray.600', 'gray.400'); // 次要文字颜色
  const chartBg = useColorModeValue('white', 'gray.800');
  const chartText = useColorModeValue('#4A5568', '#CBD5E0');
  const chartGrid = useColorModeValue('#EDF2F7', '#2D3748');
  const lineColor = useColorModeValue('#2B6CB0', '#63B3ED');

  // 生成最近 8 小时（480 分钟）的访问量模拟数据
  const visitData = useMemo(() => {
    const points = [];
    const start = Date.now() - 8 * 60 * 60 * 1000;

    for (let i = 0; i < 480; i += 1) {
      const timestamp = start + i * 60 * 1000;
      const hour = new Date(timestamp).getHours(); // 24 小时制
      const dayProfile =
        hour < 6 ? 0.35 : hour < 10 ? 0.65 : hour < 19 ? 1 : hour < 23 ? 0.75 : 0.45; // 夜间低，白天高
      const wave = 30 * Math.sin((i / 90) * Math.PI); // 让曲线有起伏
      const base = 80 + 90 * dayProfile + wave;
      const noise = Math.random() * 25;
      points.push({
        x: new Date(timestamp),
        y: Math.round(base + noise),
      });
    }

    return [
      {
        id: 'recent-visits',
        data: points,
      },
    ];
  }, []);

  return (
    <Box>
      {/* 页面标题 */}
      <Heading size="lg" mb={6}>
        仪表盘概览
      </Heading>
      
      {/* 关键指标展示区域：使用 Flex 布局，支持响应式换行 */}
      <Flex gap={6} flexWrap="wrap">
        <InfoCard title="今日访问量" value="1,245" />
        <InfoCard title="新增用户" value="56" />
        <InfoCard title="待处理工单" value="8" />
      </Flex>
      
      {/* 最近 8 小时访问量趋势 */}
      <Box mt={10} bg={chartBg} borderRadius="lg" boxShadow="sm" p={6} minH="420px">
        <Heading size="md" mb={4}>
          近 8 小时每分钟访问量
        </Heading>
        <Box height="320px">
          <ResponsiveLine
            data={visitData}
            xScale={{
              type: 'time',
              format: 'native',
              useUTC: false,
              precision: 'minute',
            }}
            xFormat="time:%H:%M"
            yScale={{ type: 'linear', stacked: false, min: 'auto', max: 'auto' }}
            axisBottom={{
              format: '%H:%M',
              tickValues: 'every 30 minutes',
              tickSize: 6,
              tickPadding: 8,
            }}
            axisLeft={{
              tickSize: 6,
              tickPadding: 8,
            }}
            margin={{ top: 20, right: 30, bottom: 50, left: 50 }}
            colors={[lineColor]}
            enablePoints={false}
            enableArea
            areaOpacity={0.15}
            enableSlices="x"
            useMesh
            crosshairType="x"
            theme={{
              textColor: chartText,
              grid: {
                line: {
                  stroke: chartGrid,
                  strokeWidth: 1,
                },
              },
              tooltip: {
                container: {
                  background: chartBg,
                  color: chartText,
                  borderRadius: 8,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
                },
              },
            }}
            sliceTooltip={({ slice }) => {
              const point = slice.points[0];
              const date = point.data.x instanceof Date ? point.data.x : new Date(point.data.x);
              const hours = date.getHours().toString().padStart(2, '0');
              const minutes = date.getMinutes().toString().padStart(2, '0');
              const timeLabel = `${hours}:${minutes}`;
              return (
                <Box p={3}>
                  <Text fontWeight="bold" mb={1}>
                    时间：{timeLabel}
                  </Text>
                  <Text color={textMuted}>访问量：{point.data.yFormatted}</Text>
                </Box>
              );
            }}
          />
        </Box>
      </Box>
      
      {/* 最近活动区域：占位内容，实际项目中可替换为真实的活动列表或图表 */}
      <Box mt={10} bg={infoBg} borderRadius="lg" boxShadow="sm" p={6}>
        <Heading size="md" mb={4}>
          最近活动
        </Heading>
        <Text color={textMuted}>这里展示系统的最新动态与提醒。</Text>
      </Box>
    </Box>
  );
};

export default DashboardPage;
