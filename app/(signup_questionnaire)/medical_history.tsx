import React, { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import MedicalHistory from "@/components/user_info/MedicalHistory";

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
    <MedicalHistory
      uid={uid}
      medicalHistory={medicalHistory}
      setMedicalHistory={setMedicalHistory}
      onSubmit={onSubmit}
    />
  );
}
