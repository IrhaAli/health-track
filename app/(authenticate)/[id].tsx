import React from "react";
import { Text } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { ThemeProvider } from "@react-navigation/native";

export default function Id() {
  const { id } = useLocalSearchParams();
  return <Text>{id}</Text>;
}
