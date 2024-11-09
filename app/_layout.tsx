import { Stack, Redirect, Slot } from "expo-router";
import { Provider } from "react-redux";
import store from "../store/store";
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';
import { useEffect, useState } from "react";
import { SessionProvider } from '../ctx';
import React from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager, Platform } from 'react-native';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'tomato',
    secondary: 'yellow',
  },
};

export default function Layout() {
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const checkLanguage = async () => {
      try {
        const language = await AsyncStorage.getItem('userLanguage');
        const shouldBeRTL = language === 'ar';
        
        if (I18nManager.isRTL !== shouldBeRTL) {
          // Configure RTL
          I18nManager.allowRTL(shouldBeRTL);
          I18nManager.forceRTL(shouldBeRTL);
          setIsRTL(shouldBeRTL);
        }
      } catch (error) {
        console.error('Error checking language direction:', error);
      }
    };

    checkLanguage();

    // Poll for language changes
    const interval = setInterval(checkLanguage, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Provider store={store}>
      <PaperProvider theme={theme}>
        <SessionProvider>
          <Slot />
        </SessionProvider>
      </PaperProvider>
    </Provider>
  );
}
