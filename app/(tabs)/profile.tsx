import { getAuth } from "firebase/auth";
import {
  setDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { StyleSheet, Image, Text, View, Pressable } from "react-native";
import { useEffect, useState } from "react";
import StressLevel from "@/components/user_info/StressLevel";
import UserDetails from "@/components/user_info/UserDetails";
import DietaryPreferences from "@/components/user_info/DietaryPreferences";
import MedicalHistory from "@/components/user_info/MedicalHistory";
import { db } from "../../firebaseConfig";
import ParallaxScrollView from "@/components/ParallaxScrollView";

export default function TabThreeScreen() {
  const uid =
    /* getAuth().currentUser?.uid || */ "PHCJD511ukbTHQfVXPu26N8rzqg1";
  const [isEdit, setIsEdit] = useState(false);
  const [dietaryPreferences, setDietaryPreferences] = useState({
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: false,
    is_dairy_free: false,
    is_nut_free: false,
    is_seafood_allergic: false,
    is_low_carb: false,
    is_high_protein: false,
    is_low_fat: false,
    is_ketogenic: false,
    is_paleo: false,
    is_mediterranean: false,
    is_soy_allergic: false,
    is_egg_allergic: false,
    is_shellfish_allergic: false,
    is_fructose_intolerant: false,
    is_halal: false,
    is_spice_free: false,
    is_sugar_free: false,
    is_salt_free: false,
  });
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [stressLevel, setStressLevel] = useState({
    stressLevel: 0,
    notes: "",
  });
  const [userDetails, setUserDetails] = useState({
    gender: null,
    bodyType: null,
    activityType: null,
    dob: new Date(),
    fullName: "",
    height: "",
    weight: "",
    wakeupTime: new Date(),
    sleepTime: new Date(),
    healthGoal: "",
  });
  const fetchData = async (collectionName: string) => {
    const collectionData = query(
      collection(db, collectionName),
      where("user_id", "==", uid)
    );
    const querySnapshot = await getDocs(collectionData);
    let docData: any[] = [];

    querySnapshot.forEach((doc) => {
      docData.push(doc.data());
    });
    return collectionName === "medical_history" ? docData : docData[0];
  };

  useEffect(() => {
    const getData = async () => {
      const userInfo = await fetchData("user_details");
      const medicalInfo = await fetchData("medical_history");
      const stressInfo = await fetchData("stress_level");
      const dietaryInfo = await fetchData("dietary_preferences");
      setUserDetails({
        gender: userInfo.gender,
        height: userInfo.height,
        weight: userInfo.weight,
        bodyType: userInfo.body_type,
        activityType: userInfo.activity,
        dob: new Date(userInfo.dob.seconds),
        fullName: userInfo.full_name,
        wakeupTime: new Date(userInfo.wakeup_time.seconds),
        sleepTime: new Date(userInfo.wakeup_time.seconds),
        healthGoal: userInfo.health_goal,
      });
      setMedicalHistory(medicalInfo);
      setStressLevel({
        stressLevel: stressInfo.stress_level,
        notes: stressInfo.notes,
      });
      setDietaryPreferences((({ user_id, ...o }) => o)(dietaryInfo));
    };
    getData();
  }, []);

  const onSubmit = () => {
    setIsEdit(false);
  };

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
        <View style={styles.buttonView}>
          <Pressable
            style={styles.button}
            onPress={() => (isEdit ? onSubmit() : setIsEdit(true))}
          >
            <Text style={styles.buttonText}>{isEdit ? "Submit" : "Edit"}</Text>
          </Pressable>
        </View>
        {isEdit ? (
          <>
            <UserDetails
              userDetails={userDetails}
              setUserDetails={setUserDetails}
            />
            <DietaryPreferences
              dietaryPreferences={dietaryPreferences}
              setDietaryPreferences={setDietaryPreferences}
            />
            <MedicalHistory
              uid={uid}
              medicalHistory={medicalHistory}
              setMedicalHistory={setMedicalHistory}
            />
            <StressLevel
              stressLevel={stressLevel}
              setStressLevel={setStressLevel}
            />
          </>
        ) : (
          <>
            <Text>HELLO</Text>
          </>
        )}
      </ParallaxScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  appLogo: {
    height: 250,
    width: 400,
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
});
