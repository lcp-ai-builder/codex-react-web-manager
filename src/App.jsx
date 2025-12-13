/**
 * 应用根组件
 * 
 * 功能说明：
 * - 应用入口组件，负责初始化国际化配置
 * - 根据当前语言设置页面标题和 HTML lang 属性
 * - 渲染路由配置组件
 * 
 * 设计原则：
 * - 保持组件足够轻量，将路由配置拆分到独立文件
 * - 使用 useEffect 同步语言设置到 DOM
 */
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AppRoutes from '@/routes';

const App = () => {
  // 国际化翻译 Hook
  const { t, i18n } = useTranslation();

  /**
   * 同步语言设置到 DOM
   * 功能：
   * 1. 根据翻译设置页面标题（document.title）
   * 2. 设置 HTML 元素的 lang 属性，便于屏幕阅读器和 SEO
   * 
   * 依赖：当语言或翻译函数变化时重新执行
   */
  useEffect(() => {
    // 设置页面标题
    const title = t('app.title');
    if (typeof title === 'string') {
      document.title = title;
    }
    
    // 设置 HTML lang 属性
    if (i18n?.language) {
      document.documentElement.lang = i18n.language;
    }
  }, [i18n?.language, t]);

  // 渲染路由配置组件
  return <AppRoutes />;
};

export default App;
