import React, { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, View, Text } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import UserDetails from "@/components/user_info/UserDetails";
import { ScrollView } from "react-native";

interface UserDetails {
  fullName: string;
  gender: string | null;
  bodyType: string | null;
  activityType: string | null;
  height: string;
  weight: string;
  dob: Date | null;
  wakeupTime: Date | null;
  sleepTime: Date | null;
  healthGoal: string;
  language: string;
}

export default function UserDetailsPanel() {
  const { email, user_id, auth_type } = useLocalSearchParams();
  const [userDetails, setUserDetails] = useState<UserDetails>({
    fullName: "",
    gender: null,
    bodyType: null,
    activityType: null,
    dob: null,
    height: "",
    weight: "",
    wakeupTime: null,
    sleepTime: null,
    healthGoal: "",
    language: "en",
  });

  const onSubmit = async () => {
    if (userDetails.fullName.length === 0) {
      Alert.alert("Please add your name");
      return;
    }
    const user = {
      user_id,
      email: email,
      full_name: userDetails.fullName,
      auth_type: auth_type || "EMAIL_PASSWORD",
      language: userDetails.language,
      is_deleted: false,
      is_ban: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const userDetailsToAdd = {
      user_id,
      gender: userDetails.gender,
      dob: userDetails.dob,
      height: userDetails.height,
      weight: userDetails.weight,
      body_type: userDetails.bodyType,
      activity: userDetails.activityType,
      health_goal: userDetails.healthGoal,
      sleep_time: userDetails.sleepTime,
      wakeup_time: userDetails.wakeupTime,
    };
    await addDoc(collection(db, "users"), user);
    await addDoc(collection(db, "user_details"), userDetailsToAdd);
    router.push("/(signup_questionnaire)/dietary_preferences");
  };

  return (
    <ScrollView>
      <UserDetails
        userDetails={UserDetails}
        setUserDetails={setUserDetails}
        isSignUpPage={true}
      />
      <View style={styles.buttonView}>
        <Pressable style={styles.button} onPress={onSubmit}>
          <Text style={styles.buttonText}>NEXT</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  appLogo: {
    height: 250,
    width: 400,
  },
  socialIcons: {
    display: "flex",
    flexDirection: "row",
  },
  container: {
    alignItems: "center",
    paddingTop: 70,
  },
  image: {
    height: 160,
    width: 170,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    paddingVertical: 40,
    color: "red",
  },
  inputView: {
    gap: 15,
    width: "100%",
    paddingHorizontal: 40,
    marginBottom: 5,
  },
  input: {
    height: 50,
    paddingHorizontal: 20,
    borderColor: "red",
    borderWidth: 1,
    borderRadius: 7,
  },
  rememberView: {
    width: "100%",
    paddingHorizontal: 50,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 8,
  },
  switch: {
    flexDirection: "row",
    gap: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  rememberText: {
    fontSize: 13,
  },
  forgetText: {
    fontSize: 11,
    color: "red",
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
  optionsText: {
    textAlign: "center",
    paddingVertical: 10,
    color: "gray",
    fontSize: 13,
    marginBottom: 6,
  },
  mediaIcons: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 23,
  },
  icons: {
    width: 40,
    height: 40,
  },
  footerText: {
    textAlign: "center",
    color: "gray",
  },
  signup: {
    color: "red",
    fontSize: 13,
  },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
