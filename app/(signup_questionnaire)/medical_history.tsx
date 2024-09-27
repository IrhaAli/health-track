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
import { Link, useLocalSearchParams, router } from "expo-router";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import * as Notifications from "expo-notifications";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import DateTimePicker from "@react-native-community/datetimepicker";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import MedicalHistory from "@/components/user_info/MedicalHistory";

interface Item {
  user_id: string;
  condition: string;
  diagnosis_date: Date;
  treatment_status: string;
  allergies: string;
  condition_label: string;
  treatment_status_label: string;
}
interface MedicalCondition extends Array<Item> {}

export default function MedicalHistoryPanel() {
  const { uid } = useLocalSearchParams() || "vP24LQvbWTOvGtH3Mh68F2pdKBd2";
  const [medicalHistory, setMedicalHistory] = useState<MedicalCondition>([]);

  const onSubmit = () => {
    medicalHistory.forEach(async (item) => {
      await addDoc(collection(db, "medical_history"), {
        user_id: uid,
        condition: item.condition,
        diagnosis_date: item.diagnosis_date,
        treatment_status: item.treatment_status,
        allergies: item.allergies,
      });
    });
    router.push({
      pathname: "/(signup_questionnaire)/stress_level",
      params: { uid },
    });
  };

  return (
    <MedicalHistory
      uid={uid}
      medicalHistory={medicalHistory}
      setMedicalHistory={setMedicalHistory}
      onSubmit={onSubmit}
    />
  );
}

const styles = StyleSheet.create({
  appLogo: {
    height: 250,
    width: 400,
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
  icons: {
    width: 40,
    height: 40,
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
  button_disabled: {
    backgroundColor: "#FFCCCB",
    height: 45,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
});
