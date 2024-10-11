import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import StressLevel from "@/components/user_info/StressLevel";
import { Pressable, View, Text, StyleSheet } from "react-native";

export default function StressLevelPanel() {
  const { uid } = useLocalSearchParams();
  const [stressLevel, setStressLevel] = useState({
    stressLevel: 0,
    notes: "",
  });

  const onSubmit = async () => {
    await addDoc(collection(db, "stress_level"), {
      user_id: uid,
      stress_level: stressLevel.stressLevel,
      notes: stressLevel.notes,
    });
    router.push({
      pathname: "/(root)",
      params: { uid },
    });
  };

  return (
    <>
      <StressLevel
        stressLevel={stressLevel}
        setStressLevel={setStressLevel}
      />
      <View style={styles.buttonView}>
        <Pressable style={styles.button} onPress={onSubmit}>
          <Text style={styles.buttonText}>SUBMIT</Text>
        </Pressable>
        <Pressable onPress={onSubmit}>
          <Text>Skip</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  appLogo: {
    height: 250,
    width: 400,
  },
  button: {
    backgroundColor: "red",
    height: 45,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonView: {
    width: "100%",
    paddingHorizontal: 50,
  },
});
