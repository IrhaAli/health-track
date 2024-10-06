import React, { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Image, StyleSheet } from "react-native";
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
  const { uid } = useLocalSearchParams() || "vP24LQvbWTOvGtH3Mh68F2pdKBd2";
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
        onSubmit={onSubmit}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  appLogo: {
    height: 250,
    width: 400,
  },
});
