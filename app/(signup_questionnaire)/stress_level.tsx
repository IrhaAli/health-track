import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import StressLevel from "@/components/user_info/StressLevel";

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
    <StressLevel
      stressLevel={stressLevel}
      setStressLevel={setStressLevel}
      notes={notes}
      setNotes={setNotes}
      onSubmit={onSubmit}
    />
  );
}
