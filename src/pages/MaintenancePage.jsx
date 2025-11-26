import { Box, Heading, Text, useColorModeValue, VStack } from '@chakra-ui/react';

const MaintenancePage = ({ title }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textMuted = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box bg={cardBg} borderRadius="lg" boxShadow="sm" p={6}>
      <VStack align="flex-start" spacing={3}>
        <Heading size="md">{title}</Heading>
        <Text color={textMuted}>
          这里是 {title} 页面占位内容，可在此对接真实业务功能。
        </Text>
      </VStack>
    </Box>
  );
};

export default MaintenancePage;
