import { Image, StyleSheet, Platform } from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={
          <Image
            source={require("@/assets/images/home-image.png")}
            style={styles.appLogo}
          />
        }
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">My Health Tracker</ThemedText>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Average Fasting Time</ThemedText>
          <ThemedText>
            This is the average fasting period since start of recording till now.
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Average Number of Meals</ThemedText>
          <ThemedText>
            This is the average number of meals/day (including snacks) since start of recording till now.
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Average Sleeping Hours</ThemedText>
          <ThemedText>
            This is the average number of sleeping hours/night since start of recording till now.
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Average Water Consumption (Cups)</ThemedText>
          <ThemedText>
            This is the average number of water drank/day since start of recording till now.
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Average Bi-Weekly Weight Change</ThemedText>
          <ThemedText>
            This is the average weight/bi-weekly since start of recording till now.
          </ThemedText>
        </ThemedView>
      </ParallaxScrollView>
    </>
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
