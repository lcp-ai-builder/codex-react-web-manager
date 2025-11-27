import { Box, Flex, Heading, Text, useColorModeValue } from '@chakra-ui/react';

// 简单的指标卡片，接收标题与数值
const InfoCard = ({ title, value }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardShadow = useColorModeValue('sm', 'dark-lg');
  const labelColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Box flex="1" minW="240px" bg={cardBg} borderRadius="lg" boxShadow={cardShadow} p={6}>
      <Text fontSize="sm" color={labelColor}>
        {title}
      </Text>
      <Text fontSize="3xl" fontWeight="bold" mt={2}>
        {value}
      </Text>
    </Box>
  );
};

const DashboardPage = () => {
  const infoBg = useColorModeValue('white', 'gray.800');
  const textMuted = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box>
      {/* 仪表盘主体信息 */}
      <Heading size="lg" mb={6}>
        仪表盘概览
      </Heading>
      {/* 指标区域：展示几个关键数字 */}
      <Flex gap={6} flexWrap="wrap">
        <InfoCard title="今日访问量" value="1,245" />
        <InfoCard title="新增用户" value="56" />
        <InfoCard title="待处理工单" value="8" />
      </Flex>
      {/* 近期动态占位块，真实项目可替换为列表或图表 */}
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
