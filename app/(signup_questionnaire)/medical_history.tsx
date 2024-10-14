import React, { useState } from "react";
import { router, Link } from "expo-router";
import { Pressable, StyleSheet, View, Text } from "react-native";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import MedicalHistory from "@/components/user_info/MedicalHistory";
import { ScrollView } from "react-native";

interface Item {
  user_id: string;
  condition: string;
  diagnosis_date: Date;
  treatment_status: string;
  allergies: string;
  is_deleted: boolean;
}
interface MedicalCondition extends Array<Item> {}

export default function MedicalHistoryPanel() {
  const [medicalHistory, setMedicalHistory] = useState<MedicalCondition>([]);

  const onSubmit = () => {
    medicalHistory.forEach(async (item) => {
      if (!item.is_deleted) {
        await addDoc(
          collection(db, "medical_history"),
          (({ is_deleted, ...o }) => o)(item)
        );
      }
    });
    router.push("/(signup_questionnaire)/stress_level");
  };

  return (
    <ScrollView>
      <MedicalHistory
        medicalHistory={medicalHistory}
        setMedicalHistory={setMedicalHistory}
      />
      <View style={styles.buttonView}>
        <Pressable style={styles.button} onPress={onSubmit}>
          <Text style={styles.buttonText}>NEXT</Text>
        </Pressable>
      </View>
      <Link href={"/(signup_questionnaire)/stress_level"}>Skip</Link>
    </ScrollView>
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
