import { StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function TabTwoScreen() {
  return (
    <>
      <ThemedView>
        <ThemedText type="title" style={styles.stepContainer}>Fast</ThemedText>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    marginLeft: 30,
    marginTop: 100,
  },
});