import { Redirect, Stack } from "expo-router";
import { useSession } from '../../ctx';
import { View } from "react-native";
import { Text } from "react-native-paper";

export default function Layout() {
  const { session, isLoading } = useSession();

  if (isLoading) { return <View><Text variant="displayLarge">Loading...</Text></View> }
  if (!session) { return <Redirect href="/login" />; }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}