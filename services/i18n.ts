import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '@/translations/en.json';
import fr from '@/translations/fr.json';
import ar from '@/translations/ar.json';

const translations = {
  en,
  fr,
  ar,
};

const i18n = new I18n(translations);
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

// Initialize with default locale
i18n.locale = 'en';

// Function to set/update locale
export const setI18nConfig = async () => {
  try {
    const storedLanguage = await AsyncStorage.getItem('userLanguage');
    if (storedLanguage) {
      i18n.locale = storedLanguage;
    }
  } catch (error) {
    console.log('Error loading language preference:', error);
  }
};

// Call setI18nConfig immediately to load stored language
setI18nConfig();

export default i18n;