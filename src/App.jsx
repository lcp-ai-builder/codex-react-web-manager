import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// 将路由配置与壳组件拆分，保持 App 入口足够轻量
import AppRoutes from '@/routes';

const App = () => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const title = t('app.title');
    if (typeof title === 'string') {
      document.title = title;
    }
    if (i18n?.language) {
      document.documentElement.lang = i18n.language;
    }
  }, [i18n?.language, t]);

  return <AppRoutes />;
};

export default App;
