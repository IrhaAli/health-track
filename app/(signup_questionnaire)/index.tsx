import React, { useState } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import UserDetails from "@/components/user_info/UserDetails";

export default function UserDetailsPanel() {
  const { email, uid, auth_type } = useLocalSearchParams();
  const language = "en";
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

  const onSubmit = async () => {
    if (userDetails.fullName.length === 0) {
      Alert.alert("Please add your name");
    } else {
      // const token = (await Notifications.getExpoPushTokenAsync()).data;
      const user = {
        user_id: uid,
        email: email,
        full_name: userDetails.fullName,
        auth_type: auth_type || "EMAIL_PASSWORD",
        language,
        // fcm_token: "",
        is_deleted: false,
        is_ban: false,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const userDetailsToAdd = {
        user_id: uid,
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
      router.push({
        pathname: "/(signup_questionnaire)/dietary_preferences",
        params: { uid },
      });
    }
  };

  return (
    <UserDetails
      userDetails={UserDetails}
      setUserDetails={setUserDetails}
      onSubmit={onSubmit}
    />
  );
}
