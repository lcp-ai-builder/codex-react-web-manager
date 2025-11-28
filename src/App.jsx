// 将路由配置与壳组件拆分，保持 App 入口足够轻量
import AppRoutes from '@/routes';

const App = () => {
  return <AppRoutes />;
};

export default App;
