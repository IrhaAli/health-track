import React, { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Image, Pressable, StyleSheet, View, Text } from "react-native";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import MedicalHistory from "@/components/user_info/MedicalHistory";
import ParallaxScrollView from "@/components/ParallaxScrollView";

interface Item {
  user_id: string;
  condition: string;
  diagnosis_date: Date;
  treatment_status: string;
  allergies: string;
  condition_label: string;
  treatment_status_label: string;
}
interface MedicalCondition extends Array<Item> {}

export default function MedicalHistoryPanel() {
  const { uid } = useLocalSearchParams();
  const [medicalHistory, setMedicalHistory] = useState<MedicalCondition>([]);

  const onSubmit = () => {
    medicalHistory.forEach(async (item) => {
      await addDoc(collection(db, "medical_history"), {
        user_id: uid,
        condition: item.condition,
        diagnosis_date: item.diagnosis_date,
        treatment_status: item.treatment_status,
        allergies: item.allergies,
      });
    });
    router.push({
      pathname: "/(signup_questionnaire)/stress_level",
      params: { uid },
    });
  };

  const onSkip = () => {
    router.push({
      pathname: "/(signup_questionnaire)/stress_level",
      params: { uid },
    });
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/home-image.png")}
          style={styles.appLogo}
        />
      }
    >
      <MedicalHistory
        uid={uid}
        medicalHistory={medicalHistory}
        setMedicalHistory={setMedicalHistory}
      />
      <View style={styles.buttonView}>
        <Pressable style={styles.button} onPress={onSubmit}>
          <Text style={styles.buttonText}>NEXT</Text>
        </Pressable>
        <Pressable onPress={onSkip}>
          <Text>Skip</Text>
        </Pressable>
      </View>
    </ParallaxScrollView>
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
