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
