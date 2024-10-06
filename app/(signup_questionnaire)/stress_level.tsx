import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import StressLevel from "@/components/user_info/StressLevel";
import { Pressable, View, Text, StyleSheet } from "react-native";

export default function StressLevelPanel() {
  const { uid } = useLocalSearchParams();
  const [stressLevel, setStressLevel] = useState(0);
  const [notes, setNotes] = useState("");

  const onSubmit = async () => {
    await addDoc(collection(db, "stress_level"), {
      user_id: uid || "vP24LQvbWTOvGtH3Mh68F2pdKBd2",
      stress_level: stressLevel,
      notes,
    });
    router.push({
      pathname: "/(tabs)",
      params: { uid },
    });
  };

  return (
    <>
      <StressLevel
        stressLevel={stressLevel}
        setStressLevel={setStressLevel}
        notes={notes}
        setNotes={setNotes}
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
