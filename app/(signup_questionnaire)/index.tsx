import React, { useState } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import UserDetails from "@/components/user_info/UserDetails";

export default function UserDetailsPanel() {
  const [gender, setGender] = useState(null);
  const [bodyType, setBodyType] = useState(null);
  const [activityType, setActivityType] = useState(null);
  const [dob, setDOB] = useState(new Date());
  const { email, uid, auth_type } = useLocalSearchParams();
  const [fullName, setFullName] = useState("");
  const language = "en";
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [wakeupTime, setWakeupTime] = useState(new Date());
  const [sleepTime, setSleepTime] = useState(new Date());
  const [healthGoal, setHealthGoal] = useState("");

  const onSubmit = async () => {
    if (fullName.length === 0) {
      Alert.alert("Please add your name");
    } else {
      // const token = (await Notifications.getExpoPushTokenAsync()).data;
      const user = {
        user_id: uid,
        email: email,
        full_name: fullName,
        auth_type: auth_type || "EMAIL_PASSWORD",
        language,
        // fcm_token: "",
        is_deleted: false,
        is_ban: false,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const userDetails = {
        user_id: uid,
        gender,
        dob,
        height,
        weight,
        body_type: bodyType,
        activity: activityType,
        health_goal: healthGoal,
        sleep_time: sleepTime,
        wakeup_time: wakeupTime,
      };
      await addDoc(collection(db, "users"), user);
      await addDoc(collection(db, "user_details"), userDetails);
      router.push({
        pathname: "/(signup_questionnaire)/dietary_preferences",
        params: { uid },
      });
    }
  };

  return (
    <UserDetails
      gender={gender}
      setGender={setGender}
      bodyType={bodyType}
      setBodyType={setBodyType}
      activityType={activityType}
      setActivityType={setActivityType}
      dob={dob}
      setDOB={setDOB}
      fullName={fullName}
      setFullName={setFullName}
      height={height}
      setHeight={setHeight}
      weight={weight}
      setWeight={setWeight}
      wakeupTime={wakeupTime}
      setWakeupTime={setWakeupTime}
      sleepTime={sleepTime}
      setSleepTime={setSleepTime}
      healthGoal={healthGoal}
      setHealthGoal={setHealthGoal}
      onSubmit={onSubmit}
    />
  );
}
