import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import UserDetails from "@/components/user_info/UserDetails";
import { ScrollView } from "react-native";
import { Button, Surface } from "react-native-paper";

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
      <Surface style={styles.container}>
        <UserDetails
          userDetails={UserDetails}
          setUserDetails={setUserDetails}
          isSignUpPage={true}
        />
        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={onSubmit}
            style={styles.button}
          >
            Next
          </Button>
        </View>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    elevation: 1,
    borderRadius: 12
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24
  },
  button: {
    borderRadius: 8
  }
});
