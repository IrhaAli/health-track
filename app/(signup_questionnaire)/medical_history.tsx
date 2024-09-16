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

export default function MedicalHistory() {
  const { uid } = useLocalSearchParams();
  const [condition, setCondition] = useState();
  const [allergies, setAllergies] = useState("");
  const [isConditionFocus, setIsConditionFocus] = useState(false);
  const [treatmentStatus, setTreatmentStatus] = useState();
  const [isTreatmentStatusFocus, setIsTreatmentStatusFocus] = useState(false);
  const [dateOfDiagnosis, setDateOfDiagnosis] = useState(new Date());
  const [medicalHistory, setMedicalHistory] = useState([
    {
      user_id: uid,
      condition: "",
      diagnosis_date: null,
      treatment_status: "",
      allergies: "",
    },
  ]);
  const conditionOptions = [
    {
      label: "Taking medication",
      value: "heart_condition",
    },
  ];
  const treatmentStatusOptions = [
    {
      label: "Taking Medication",
      value: "taking_medication",
    },
  ];

  const additionalMedicalHistory = () => {
    setMedicalHistory((prev) => [
      ...prev,
      {
        user_id: uid,
        condition: "",
        diagnosis_date: null,
        treatment_status: "",
        allergies: "",
      },
    ]);
  };

  const removeMedicalHistory = (index: number) => {
    console.log(medicalHistory.length);
    setMedicalHistory((prev) => prev.splice(index, 1));
    console.log(medicalHistory.length);
  };

  const onSubmit = () => {
    // uid: uid || "vP24LQvbWTOvGtH3Mh68F2pdKBd2";
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
        <Text style={styles.title}>Medical History</Text>
        <View style={styles.inputView}>
          {medicalHistory.map((item, index) => (
            <>
              <Pressable
                style={styles.button}
                onPress={() => removeMedicalHistory(index)}
              >
                <Text style={styles.buttonText}>Remove Record</Text>
              </Pressable>
              <Text>Condition</Text>
              <Dropdown
                style={[
                  styles.dropdown,
                  isConditionFocus && { borderColor: "blue" },
                ]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                iconStyle={styles.iconStyle}
                data={conditionOptions}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isConditionFocus ? "Select a Condition" : "..."}
                value={item.condition}
                onFocus={() => setIsConditionFocus(true)}
                onBlur={() => setIsConditionFocus(false)}
                onChange={(item: any) => {
                  setCondition(item.value);
                  setIsConditionFocus(false);
                }}
                renderLeftIcon={() => (
                  <AntDesign
                    style={styles.icon}
                    color={isConditionFocus ? "blue" : "black"}
                    name="Safety"
                    size={20}
                  />
                )}
              />
              <Text>Diagnosis Date</Text>
              <DateTimePicker
                mode="date"
                value={dateOfDiagnosis}
                onChange={(event: any, value: Date | undefined) =>
                  setDateOfDiagnosis(value || new Date())
                }
              />
              <Text>Treatment Status</Text>
              <Dropdown
                style={[
                  styles.dropdown,
                  isTreatmentStatusFocus && { borderColor: "blue" },
                ]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                iconStyle={styles.iconStyle}
                data={treatmentStatusOptions}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={
                  !isTreatmentStatusFocus ? "Treatment Status" : "..."
                }
                value={treatmentStatus}
                onFocus={() => setIsTreatmentStatusFocus(true)}
                onBlur={() => setIsTreatmentStatusFocus(false)}
                onChange={(item: any) => {
                  setTreatmentStatus(item.value);
                  setIsTreatmentStatusFocus(false);
                }}
                renderLeftIcon={() => (
                  <AntDesign
                    style={styles.icon}
                    color={isConditionFocus ? "blue" : "black"}
                    name="Safety"
                    size={20}
                  />
                )}
              />
              <Text>Allergies</Text>
              <TextInput
                style={styles.input}
                placeholder="Any allergies..."
                value={allergies}
                onChangeText={setAllergies}
                autoCorrect={false}
                autoCapitalize="none"
              />
            </>
          ))}
          <Pressable style={styles.button} onPress={additionalMedicalHistory}>
            <Text style={styles.buttonText}>Add More Records</Text>
          </Pressable>
        </View>
        <View style={styles.buttonView}>
          <Pressable style={styles.button} onPress={onSubmit}>
            <Text style={styles.buttonText}>NEXT</Text>
          </Pressable>
          <Link href={"/(signup_questionnaire)/stress_level"}>Skip</Link>
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
});
