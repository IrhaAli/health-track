import { Stack, Redirect, Slot } from "expo-router";
import { Provider } from "react-redux";
import store from "../store/store";
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { SessionProvider } from '../ctx';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'tomato',
    secondary: 'yellow',
  },
};

export default function Layout() {
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
