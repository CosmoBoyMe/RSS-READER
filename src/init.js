import i18next from 'i18next';
import resources from './locales/index.js';
import runApp from './index.js';

export default () => {
  const i18nextInstance = i18next.createInstance();
  return i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => {
    runApp(i18nextInstance);
  });
};
