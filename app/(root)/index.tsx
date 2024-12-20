import { Image, StyleSheet, Platform } from "react-native";
import HomeComponent from "@/components/home/home";
import React from "react";

export default function HomeScreen() {
  return (
    <HomeComponent />
  );
}

const styles = StyleSheet.create({
  appLogo: {
    height: 250,
    width: 400,
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
});
