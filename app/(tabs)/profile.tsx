import { getAuth } from "firebase/auth";
import {
  setDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useEffect } from "react";
import StressLevel from "../(signup_questionnaire)/stress_level";

export default function TabThreeScreen() {
  const userId = getAuth().currentUser?.uid || "PHCJD511ukbTHQfVXPu26N8rzqg1";
  const [profileData, setProfileData] = useState({
    dietaryPreferences: {},
    medicalHistory: [],
    StressLevel: {},
    userDetails: {},
  });

  useEffect(() => {}, []);

  return <>PROFILE PAGE</>;
}
