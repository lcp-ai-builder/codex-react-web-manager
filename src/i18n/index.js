import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from './locales/en/common.json';
import zhCommon from './locales/zh-CN/common.json';

const resources = {
  en: { common: enCommon },
  'zh-CN': { common: zhCommon },
};

const storageKey = 'app.lang';
const supportedLngs = ['en', 'zh-CN'];
const fallbackLng = 'en';

const getInitialLanguage = () => {
  if (typeof window === 'undefined') return fallbackLng;
  const stored = window.localStorage.getItem(storageKey);
  if (stored && supportedLngs.includes(stored)) return stored;
  return fallbackLng;
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng,
  supportedLngs,
  ns: ['common'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (lng) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey, lng);
});

export default i18n;
