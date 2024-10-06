import React from "react";
import Slider from "@react-native-community/slider";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function StressLevel({ stressLevel, setStressLevel }: any) {
  return (
    <>
      <View style={styles.inputView}>
        <Text>Stress Level: {stressLevel.stressLevel}</Text>
        <Slider
          minimumValue={1}
          maximumValue={10}
          step={1}
          onValueChange={(value: number) =>
            setStressLevel((prev: any) => ({ ...prev, stress_level: value }))
          }
        />
        <Text>Notes</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={5}
          placeholder="Any notes..."
          value={stressLevel.notes}
          onChangeText={(item: string) => {
            setStressLevel((prev: any) => ({ ...prev, notes: item }));
          }}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  appLogo: {
    height: 250,
    width: 400,
  },
  container: {
    alignItems: "center",
    paddingTop: 70,
  },
  image: {
    height: 160,
    width: 170,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    paddingVertical: 40,
    color: "red",
  },
  inputView: {
    gap: 15,
    width: "100%",
    paddingHorizontal: 40,
    marginBottom: 5,
  },
  input: {
    height: 200,
    paddingHorizontal: 20,
    borderColor: "red",
    borderWidth: 1,
    borderRadius: 7,
  },
  icons: {
    width: 40,
    height: 40,
  },
  signup: {
    color: "red",
    fontSize: 13,
  },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
});
