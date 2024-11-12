import {  Slot } from "expo-router";
import { Provider } from "react-redux";
import store from "../store/store";
import { PaperProvider } from 'react-native-paper';
import { SessionProvider } from '../ctx';
import React from "react";
import { theme } from "./theme";

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
