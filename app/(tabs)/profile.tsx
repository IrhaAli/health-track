import { getAuth } from "firebase/auth";
import {
  setDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import StressLevel from "../(signup_questionnaire)/stress_level";
import UserDetails from "@/components/user_info/UserDetails";
import DietaryPreferences from "@/components/user_info/DietaryPreferences";
import MedicalHistory from "@/components/user_info/MedicalHistory";

export default function TabThreeScreen() {
  const uid = getAuth().currentUser?.uid || "PHCJD511ukbTHQfVXPu26N8rzqg1";
  const [profileData, setProfileData] = useState({
    dietaryPreferences: {},
    medicalHistory: [],
    StressLevel: {},
    userDetails: {},
  });
  const [dietaryPreferences, setDietaryPreferences] = useState({});
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [stressLevel, setStressLevel] = useState(0);
  const [notes, setNotes] = useState("");
  const [userDetails, setUserDetails] = useState({});

  useEffect(() => {}, []);

  const onSubmit = () => {};

  return (
    <>
      <UserDetails
        userDetails={userDetails}
        setUserDetails={setUserDetails}
        onSubmit={onSubmit}
      />
      <DietaryPreferences
        dietaryPreferences={dietaryPreferences}
        setDietaryPreferences={setDietaryPreferences}
        onSubmit={onSubmit}
      />
      <MedicalHistory
        uid={uid}
        medicalHistory={medicalHistory}
        setMedicalHistory={setMedicalHistory}
        onSubmit={onSubmit}
      />
      <StressLevel
        stressLevel={stressLevel}
        setStressLevel={setStressLevel}
        notes={notes}
        setNotes={setNotes}
        onSubmit={onSubmit}
      />
    </>
  );
}
