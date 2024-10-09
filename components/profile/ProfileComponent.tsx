import { StyleSheet, Image, Text } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import ProfileUserDetails from "./ProfileUserDetails";
import ProfileDietaryPreferences from "./ProfileDietaryPreferences";
import ProfileMedicalHistory from "./ProfileMedicalHistory";
import ProfileStressLevel from "./ProfileStressLevel";
import ProfileFooterLinks from "./ProfileFooterLinks";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useEffect, useState } from "react";

export default function ProfileComponent() {
  const uid =
    /* getAuth().currentUser?.uid || */ "PHCJD511ukbTHQfVXPu26N8rzqg1";
  const [userInfo, setUserInfo] = useState({
    fullName: "",
    email: "",
  });

  const fetchData = async (collectionName: string) => {
    const collectionData = query(
      collection(db, collectionName),
      where("user_id", "==", uid)
    );
    const querySnapshot = await getDocs(collectionData);
    let docData: any[] = [];

    querySnapshot.forEach((doc) => {
      docData.push({ id: doc.id, ...doc.data() });
    });
    return collectionName === "medical_history" ? docData : docData[0];
  };

  useEffect(() => {
    const getData = async () => {
      const userInfo = await fetchData("users");
      setUserInfo({
        fullName: userInfo.full_name,
        email: userInfo.email,
      });
    };
    getData();
  }, []);

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={
          <Image
            source={require("@/assets/images/home-image.png")}
            style={styles.appLogo}
          />
        }
      >
        <Text style={styles.title}>My Profile</Text>
        <Text>{userInfo.fullName}</Text>
        <Text>{userInfo.email}</Text>
        <ProfileUserDetails></ProfileUserDetails>
        <ProfileDietaryPreferences></ProfileDietaryPreferences>
        <ProfileMedicalHistory></ProfileMedicalHistory>
        <ProfileStressLevel></ProfileStressLevel>
        <ProfileFooterLinks></ProfileFooterLinks>
      </ParallaxScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  appLogo: {
    height: 250,
    width: 400,
  },
  input: {
    height: 200,
    paddingHorizontal: 20,
    borderColor: "red",
    borderWidth: 1,
    borderRadius: 7,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    paddingVertical: 40,
    color: "red",
  },
  buttonView: {
    width: "100%",
    paddingHorizontal: 50,
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
  buttonTextRed: {
    color: "red",
  },
  buttonTextBlue: {
    color: "blue",
    textDecorationLine: "underline",
  },
});
