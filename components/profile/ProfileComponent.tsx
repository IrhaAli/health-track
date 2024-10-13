import ProfileFooterLinks from "./ProfileFooter";
import ProfileHeader from "./ProfileHeader";
import { Button } from "react-native-paper";
import { Link } from "expo-router";
import ProfileContactForm from "./ProfileContactForm";
import { getAuth } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/userSlice";
import { AppDispatch } from "@/store/store";

export default function ProfileComponent() {
  const auth = getAuth();
  const dispatch = useDispatch<AppDispatch>();

  const getUserData = async () => {
    const collectionData = query(
      collection(db, "users"),
      where("user_id", "==", auth.currentUser?.uid)
    );
    const querySnapshot = await getDocs(collectionData);
    let docData: any[] = [];
    querySnapshot.forEach((doc) => {
      docData.push({ id: doc.id, ...doc.data() });
    });

    const userInfo = docData[0];
    dispatch(setUser(JSON.stringify(userInfo)));
  };
  getUserData();

  return (
    <>
      <ProfileHeader></ProfileHeader>
      <Link href="/(profile)/background_information">
        <Button mode="contained">Background Information</Button>
      </Link>
      <Link href="/(profile)/dietary_preferences">
        <Button mode="contained">Dietary Preferences</Button>
      </Link>
      <Link href="/(profile)/medical_history">
        <Button mode="contained">Medical History</Button>
      </Link>
      <Link href="/(profile)/stress_level">
        <Button mode="contained">Stress Level</Button>
      </Link>
      <ProfileContactForm></ProfileContactForm>
      <ProfileFooterLinks></ProfileFooterLinks>
    </>
  );
}
