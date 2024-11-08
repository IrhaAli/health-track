import { Redirect, Stack } from "expo-router";
import { useSession } from '../../ctx';
import { View } from "react-native";
import { Text } from "react-native-paper";
import React from "react";

export default function Layout() {
  const { session, isLoading, isFirstLaunch } = useSession();

  if (isLoading) { return <View><Text variant="displayLarge">Loading...</Text></View> }
  
  if (isFirstLaunch) {
    return <Redirect href="/language" />;
  }

  if (!session) { 
    return <Redirect href="/login" />; 
  }
  
  return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    );
}
