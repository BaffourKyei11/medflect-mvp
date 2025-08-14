export const resources = {
  en: {
    common: () => import('../locales/en/common.json'),
  },
  twi: {
    common: () => import('../locales/twi/common.json'),
  },
  ga: {
    common: () => import('../locales/ga/common.json'),
  },
};

export type SupportedLocale = keyof typeof resources;
