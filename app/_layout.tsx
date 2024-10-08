import { Stack } from "expo-router";
import { Provider } from "react-redux";
import store from "../store/store";
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';

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
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </PaperProvider>
    </Provider>
  );
}
