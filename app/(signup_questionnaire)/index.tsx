import React, { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  Image,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import * as Notifications from "expo-notifications";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import DateTimePicker from "@react-native-community/datetimepicker";
import ParallaxScrollView from "@/components/ParallaxScrollView";

export default function SignUpForm() {
  const [gender, setGender] = useState(null);
  const [bodyType, setBodyType] = useState(null);
  const [activityType, setActivityType] = useState(null);
  const [dob, setDOB] = useState(new Date());
  const [measurementType, setMeasurementType] = useState("cm");
  const [weightType, setWeightType] = useState("");
  const { email, uid, auth_type } = useLocalSearchParams();
  const [fullName, setFullName] = useState("");
  const language = "en";
  const [height, setHeight] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [weight, setWeight] = useState("");
  const [wakeupTime, setWakeupTime] = useState(new Date());
  const [sleepTime, setSleepTime] = useState(new Date());
  const [healthGoal, setHealthGoal] = useState("");

  const [isGenderFocus, setIsGenderFocus] = useState(false);
  const [isBodyTypeFocus, setIsBodyTypeFocus] = useState(false);
  const [isActivityFocus, setIsActivityFocus] = useState(false);
  const [isMeasurementTypeFocus, setIsMeasurementTypeFocus] = useState(false);
  const [isWeightTypeFocus, setIsWeightTypeFocus] = useState(false);
  const [isHealthGoalTypeFocus, setIsHealthGoalTypeFocus] = useState(false);

  const genderOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
  ];
  const bodyTypeOptions = [
    { label: "Curvy", value: "curvy" },
    { label: "Slim", value: "slim" },
    { label: "Athletic", value: "athletic" },
    { label: "Muscular", value: "muscular" },
    { label: "Heavyset", value: "heavyset" },
  ];
  const activityTypeOptions = [
    { label: "Gym", value: "gym" },
    { label: "Yoga", value: "yoga" },
    { label: "Walking", value: "walking" },
    { label: "Sports", value: "sports" },
    { label: "Hiking", value: "hiking" },
    { label: "Strength Training", value: "strength-training" },
    { label: "Other", value: "other" },
  ];
  const measurementTypeOptions = [
    { label: "ft", value: "ft" },
    { label: "cm", value: "cm" },
  ];
  const weightTypeOptions = [
    { label: "lbs", value: "lbs" },
    { label: "kg", value: "kg" },
  ];
  const healthGoalOptions = [
    { label: "Desired Weight", value: "desired-weight" },
    { label: "Muscle Gain", value: "muscle-gain" },
    { label: "General Fitness", value: "general-fitness" },
  ];

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
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/home-image.png")}
          style={styles.appLogo}
        />
      }
    >
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Background Information</Text>
        <View style={styles.inputView}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            autoCorrect={false}
            autoCapitalize="none"
          />
          <Text>Date of Birth</Text>
          <DateTimePicker
            mode="date"
            value={dob}
            onChange={(event: any, value: Date | undefined) =>
              setDOB(value || new Date())
            }
          />
          <Dropdown
            style={[styles.dropdown, isGenderFocus && { borderColor: "blue" }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            data={genderOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isGenderFocus ? "Select Gender" : "..."}
            value={gender}
            onFocus={() => setIsGenderFocus(true)}
            onBlur={() => setIsGenderFocus(false)}
            onChange={(item: any) => {
              setGender(item.value);
              setIsGenderFocus(false);
            }}
            renderLeftIcon={() => (
              <AntDesign
                style={styles.icon}
                color={isGenderFocus ? "blue" : "black"}
                name="Safety"
                size={20}
              />
            )}
          />
          <Dropdown
            style={[
              styles.dropdown,
              isBodyTypeFocus && { borderColor: "blue" },
            ]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            data={bodyTypeOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isBodyTypeFocus ? "Select Body Type" : "..."}
            value={bodyType}
            onFocus={() => setIsBodyTypeFocus(true)}
            onBlur={() => setIsBodyTypeFocus(false)}
            onChange={(item: any) => {
              setBodyType(item.value);
              setIsBodyTypeFocus(false);
            }}
            renderLeftIcon={() => (
              <AntDesign
                style={styles.icon}
                color={isBodyTypeFocus ? "blue" : "black"}
                name="Safety"
                size={20}
              />
            )}
          />
          <Dropdown
            style={[
              styles.dropdown,
              isActivityFocus && { borderColor: "blue" },
            ]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            data={activityTypeOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isActivityFocus ? "Select Activity Type" : "..."}
            value={activityType}
            onFocus={() => setIsActivityFocus(true)}
            onBlur={() => setIsActivityFocus(false)}
            onChange={(item: any) => {
              setActivityType(item.value);
              setIsActivityFocus(false);
            }}
            renderLeftIcon={() => (
              <AntDesign
                style={styles.icon}
                color={isActivityFocus ? "blue" : "black"}
                name="Safety"
                size={20}
              />
            )}
          />
          {measurementType === "cm" ? (
            <TextInput
              style={styles.input}
              placeholder="Height in cm"
              value={height}
              onChangeText={setHeight}
              autoCorrect={false}
              autoCapitalize="none"
            />
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="ft"
                value={feet}
                onChangeText={setFeet}
                autoCorrect={false}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="in"
                value={inches}
                onChangeText={setInches}
                autoCorrect={false}
                autoCapitalize="none"
              />
            </>
          )}

          <Dropdown
            style={[
              styles.dropdown,
              isMeasurementTypeFocus && { borderColor: "blue" },
            ]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            data={measurementTypeOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={
              !isMeasurementTypeFocus ? "Select Measurement Unit" : "..."
            }
            value={measurementType}
            onFocus={() => setIsMeasurementTypeFocus(true)}
            onBlur={() => setIsMeasurementTypeFocus(false)}
            onChange={(item: any) => {
              setMeasurementType(item.value);
              setIsMeasurementTypeFocus(false);
            }}
            renderLeftIcon={() => (
              <AntDesign
                style={styles.icon}
                color={isMeasurementTypeFocus ? "blue" : "black"}
                name="Safety"
                size={20}
              />
            )}
          />
          <TextInput
            style={styles.input}
            placeholder="Add weight here..."
            value={weight}
            onChangeText={setWeight}
            autoCorrect={false}
            autoCapitalize="none"
          />
          <Dropdown
            style={[
              styles.dropdown,
              isWeightTypeFocus && { borderColor: "blue" },
            ]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            data={weightTypeOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isWeightTypeFocus ? "Select Weight Unit" : "..."}
            value={weightType}
            onFocus={() => setIsWeightTypeFocus(true)}
            onBlur={() => setIsWeightTypeFocus(false)}
            onChange={(item: any) => {
              setWeightType(item.value);
              setIsWeightTypeFocus(false);
            }}
            renderLeftIcon={() => (
              <AntDesign
                style={styles.icon}
                color={isWeightTypeFocus ? "blue" : "black"}
                name="Safety"
                size={20}
              />
            )}
          />
          <Text>Wakeup Time</Text>
          <DateTimePicker
            mode="time"
            value={wakeupTime}
            onChange={(event: any, value: Date | undefined) =>
              setWakeupTime(value || new Date())
            }
          />
          <Text>Sleep Time</Text>
          <DateTimePicker
            mode="time"
            value={sleepTime}
            onChange={(event: any, value: Date | undefined) =>
              setSleepTime(value || new Date())
            }
          />
          <Text>Health Goal</Text>
          <Dropdown
            style={[
              styles.dropdown,
              isHealthGoalTypeFocus && { borderColor: "blue" },
            ]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            data={healthGoalOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isHealthGoalTypeFocus ? "Select Health Goal" : "..."}
            value={healthGoal}
            onFocus={() => setIsHealthGoalTypeFocus(true)}
            onBlur={() => setIsHealthGoalTypeFocus(false)}
            onChange={(item: any) => {
              setHealthGoal(item.value);
              setIsHealthGoalTypeFocus(false);
            }}
            renderLeftIcon={() => (
              <AntDesign
                style={styles.icon}
                color={isGenderFocus ? "blue" : "black"}
                name="Safety"
                size={20}
              />
            )}
          />
        </View>
        <View style={styles.buttonView}>
          <Pressable style={styles.button} onPress={onSubmit}>
            <Text style={styles.buttonText}>NEXT</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </ParallaxScrollView>
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
