import { getAuth } from "firebase/auth";
import {
  setDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  StyleSheet,
  Image,
  Text,
  View,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import StressLevel from "@/components/user_info/StressLevel";
import UserDetails from "@/components/user_info/UserDetails";
import DietaryPreferences from "@/components/user_info/DietaryPreferences";
import MedicalHistory from "@/components/user_info/MedicalHistory";
import { db } from "../../firebaseConfig";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { Link } from "expo-router";
import AlertAsync from "react-native-alert-async";

export default function TabThreeScreen() {
  const uid =
    /* getAuth().currentUser?.uid || */ "PHCJD511ukbTHQfVXPu26N8rzqg1";
  const [isEdit, setIsEdit] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [dietaryPreferences, setDietaryPreferences] = useState({
    docId: null,
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
    docId: null,
    stressLevel: 0,
    notes: "",
  });
  const [userDetails, setUserDetails] = useState({
    docId: null,
    gender: null,
    bodyType: null,
    activityType: null,
    dob: new Date(),
    height: "",
    weight: "",
    wakeupTime: new Date(),
    sleepTime: new Date(),
    healthGoal: "",
  });
  const [contactUs, setContactUs] = useState("");
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
  const dietaryPreferencesLabels = {
    is_vegetarian: "Vegetarian",
    is_vegan: "Vegan",
    is_gluten_free: "Gluten Free",
    is_dairy_free: "Dairy Free/Lactose Intolerant",
    is_nut_free: "Nut Free",
    is_seafood_allergic: "Seafood Allergy",
    is_low_carb: "Low Carb",
    is_high_protein: "High Protein",
    is_low_fat: "Low Fat",
    is_ketogenic: "Ketogenic",
    is_paleo: "Paleo",
    is_mediterranean: "Mediterranean",
    is_soy_allergic: "Soy Allergy",
    is_egg_allergic: "Egg Allergy",
    is_shellfish_allergic: "Shellfish Allergy",
    is_fructose_intolerant: "Fructose Intolerant",
    is_halal: "Halal",
    is_spice_free: "Spice Free",
    is_sugar_free: "Sugar Free",
    is_salt_free: "Salt Free",
  };

  useEffect(() => {
    const getData = async () => {
      const userInfo = await fetchData("user_details");
      const userName = await fetchData("users");
      const medicalInfo = await fetchData("medical_history");
      const stressInfo = await fetchData("stress_level");
      const dietaryInfo = await fetchData("dietary_preferences");
      setUserDetails({
        docId: userInfo.id,
        gender: userInfo.gender,
        height: userInfo.height,
        weight: userInfo.weight,
        bodyType: userInfo.body_type,
        activityType: userInfo.activity,
        dob: new Date(userInfo.dob.seconds),
        wakeupTime: new Date(userInfo.wakeup_time.seconds),
        sleepTime: new Date(userInfo.wakeup_time.seconds),
        healthGoal: userInfo.health_goal,
      });
      setMedicalHistory(medicalInfo);
      setStressLevel({
        docId: stressInfo.id,
        stressLevel: stressInfo.stress_level,
        notes: stressInfo.notes,
      });
      setDietaryPreferences((({ user_id, ...o }) => o)(dietaryInfo));
    };
    getData();
  }, []);

  const onSubmit = async () => {
    setIsEdit(false);
    setIsDisabled(true);
    const updateUserDetails = doc(db, "user_details", userDetails.docId || "");
    const updateMedicalHistory = medicalHistory.map((item: any) =>
      doc(db, "medical_history", item.docId)
    );
    const updateDietaryPreferencesDetails = doc(
      db,
      "dietary_preferences",
      dietaryPreferences.docId || ""
    );
    const updateStressLevelDetails = doc(
      db,
      "stress_level",
      stressLevel.docId || ""
    );

    await updateDoc(updateUserDetails, {
      gender: userDetails.gender,
      body_type: userDetails.bodyType,
      activity_type: userDetails.activityType,
      dob: userDetails.dob,
      height: userDetails.height,
      weight: userDetails.weight,
      wakeup_time: userDetails.wakeupTime,
      sleep_time: userDetails.sleepTime,
      health_goal: userDetails.healthGoal,
    });
    updateMedicalHistory.forEach(
      async (item) =>
        await updateDoc(item, {
          allergies: item.allergies,
          condition: item.condition,
          diagnosis_date: item.diagnosis_date,
          treatment_status: item.treatment_status,
        })
    );
    await updateDoc(
      updateDietaryPreferencesDetails,
      (({ docId, ...o }) => o)(dietaryPreferences)
    );
    await updateDoc(updateStressLevelDetails, {
      stress_level: stressLevel.stressLevel,
      notes: stressLevel.notes,
    });
    setIsDisabled(false);
  };

  const onContactSend = () => {
    console.log("Contacted");
    setContactUs("");
  };

  const onLogout = () => {
    console.log("Logged Out");
  };

  const onAccountDelete = async () => {
    const choice = await AlertAsync(
      "Are you sure you want to delete your account?",
      "Your Account will be deleted permanently",
      [
        { text: "Yes", onPress: () => true },
        { text: "No", onPress: () => false },
      ]
    );

    if (!choice) return;
    // Change is_deleted to true in users table
    console.log("Account Deleted");
    onLogout();
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
        {isEdit ? (
          <>
            <View
              style={styles.buttonView}
              pointerEvents={isDisabled ? "none" : "auto"}
            >
              <Pressable style={styles.button} onPress={onSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
              </Pressable>
              <Pressable style={styles.button} onPress={() => setIsEdit(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
            </View>
            <UserDetails
              userDetails={userDetails}
              setUserDetails={setUserDetails}
              needFullName={false}
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
            <View style={styles.buttonView}>
              <Pressable style={styles.button} onPress={() => setIsEdit(true)}>
                <Text style={styles.buttonText}>Edit</Text>
              </Pressable>
            </View>
            <Text style={styles.title}>Background Information</Text>
            <Text>Gender: {userDetails.gender}</Text>
            <Text>Height: {userDetails.height}</Text>
            <Text>Weight: {userDetails.weight}</Text>
            <Text>Body Type: {userDetails.bodyType}</Text>
            <Text>Activity Type: {userDetails.activityType}</Text>
            <Text>DOB: {`${userDetails.dob}`}</Text>
            <Text>Wakeup Time: {`${userDetails.wakeupTime}`}</Text>
            <Text>Sleep Time: {`${userDetails.sleepTime}`}</Text>
            <Text>Health Goal: {userDetails.healthGoal}</Text>

            <Text style={styles.title}>Dietary Preferences</Text>
            {Object.keys(dietaryPreferences).map(
              (item: string, index: number) => {
                if (dietaryPreferences[item] === true) {
                  return (
                    <Text key={index}>{dietaryPreferencesLabels[item]}</Text>
                  );
                }
              }
            )}

            <Text style={styles.title}>Medical History</Text>
            {medicalHistory.map((item: any, index: number) => {
              return (
                <View key={index}>
                  <Text>{item.allergies}</Text>
                  <Text>{item.condition}</Text>
                  <Text>{`${new Date(item.diagnosis_date.seconds)}`}</Text>
                  <Text>{item.treatment_status}</Text>
                </View>
              );
            })}

            <Text style={styles.title}>Stress Level</Text>
            <Text>Stress Level: {stressLevel.stressLevel}</Text>
            <Text>Notes: {stressLevel.notes}</Text>
          </>
        )}
        <Text>Contact Us</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={5}
          placeholder="Contact us here..."
          value={contactUs}
          onChangeText={(item: string) => {
            setContactUs(item);
          }}
          autoCorrect={false}
          autoCapitalize="none"
        />
        <View style={styles.buttonView}>
          <Pressable style={styles.button} onPress={onContactSend}>
            <Text style={styles.buttonText}>Send</Text>
          </Pressable>
        </View>
        <View style={styles.buttonView}>
          <Pressable style={styles.button} onPress={onLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </Pressable>
        </View>
        <Text style={styles.buttonTextRed} onPress={onAccountDelete}>
          Delete My Account
        </Text>
        <Link href="www.google.com">
          <Text style={styles.buttonTextBlue}>Privacy Policy</Text>
        </Link>
        <Link href="www.google.com">
          <Text style={styles.buttonTextBlue}>Terms and Conditions</Text>
        </Link>
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
