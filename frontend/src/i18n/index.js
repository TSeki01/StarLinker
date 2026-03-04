import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhTW from './zh-TW.json';
import ja from './ja.json';
import ko from './ko.json';

i18n.use(initReactI18next).init({
    resources: {
        'zh-TW': { translation: zhTW },
        ja: { translation: ja },
        ko: { translation: ko },
    },
    lng: 'zh-TW',
    fallbackLng: 'ja',
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
