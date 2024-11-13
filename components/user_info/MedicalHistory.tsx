import React, { useState, useEffect } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Item {
  user_id: string;
  condition: string;
  diagnosis_date: Date;
  treatment_status: string;
  allergies: string;
  is_deleted: boolean;
}
interface MedicalCondition extends Array<Item> {}

export default function MedicalHistory({
  medicalHistory,
  setMedicalHistory,
}: any) {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const userString = await AsyncStorage.getItem('session');
      if (userString) {
        const user = JSON.parse(userString);
        setCurrentUser(user);
      }
    };
    getUser();
  }, []);

  const emptyCondition: Item = {
    user_id: currentUser?.uid || "",
    condition: "",
    diagnosis_date: new Date(),
    treatment_status: "",
    allergies: "",
    is_deleted: true,
  };
  const [currentMedicalCondition, setCurrentMedicalCondition] =
    useState<Item>(emptyCondition);
  const [isConditionFocus, setIsConditionFocus] = useState(false);
  const [isTreatmentStatusFocus, setIsTreatmentStatusFocus] = useState(false);
  const conditionOptions = [
    {
      label: "Heart Condition",
      value: "heart_condition",
    },
  ];
  const treatmentStatusOptions = [
    {
      label: "Taking Medication",
      value: "taking_medication",
    },
  ];

  const addMedicalHistory = () => {
    if (currentMedicalCondition.condition.length === 0) return;
    setMedicalHistory((prev: any) => [
      ...prev,
      {
        ...currentMedicalCondition,
        user_id: currentUser?.uid,
        is_deleted: false,
      },
    ]);
    setCurrentMedicalCondition(emptyCondition);
  };

  const removeMedicalHistory = (index: number) => {
    setMedicalHistory((prev: any) =>
      prev.map((item: any, i: number) =>
        i === index ? { ...item, is_deleted: true } : item
      )
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Medical History</Text>
      <View style={styles.inputView}>
        <>
          {/* Added conditions */}
          {medicalHistory.map((item: any, index: number) => {
            return (
              !item.is_deleted && (
                <View key={index}>
                  <Pressable
                    style={styles.button}
                    onPress={() => removeMedicalHistory(index)}
                  >
                    <Text style={styles.buttonText}>Remove Record</Text>
                  </Pressable>
                  <Text>Condition # {index + 1}</Text>
                  <Text>Condition: {medicalHistory[index].condition}</Text>
                  <Text>Diagnosis Date {`${item.diagnosis_date}`}</Text>
                  <Text>Treatment Status: {item.treatment_status}</Text>
                  <Text>Allergies {item.allergies}</Text>
                </View>
              )
            );
          })}
          <>
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
              value={currentMedicalCondition.condition}
              onFocus={() => setIsConditionFocus(true)}
              onBlur={() => setIsConditionFocus(false)}
              onChange={(item: any) => {
                setCurrentMedicalCondition((prev) => ({
                  ...prev,
                  condition: item.value,
                }));
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
              value={currentMedicalCondition.diagnosis_date}
              onChange={(event: any, value: Date | undefined) =>
                setCurrentMedicalCondition((prev) => ({
                  ...prev,
                  diagnosis_date: value || new Date(),
                }))
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
              placeholder={!isTreatmentStatusFocus ? "Treatment Status" : "..."}
              value={currentMedicalCondition.treatment_status}
              onFocus={() => setIsTreatmentStatusFocus(true)}
              onBlur={() => setIsTreatmentStatusFocus(false)}
              onChange={(item: any) => {
                setCurrentMedicalCondition((prev) => ({
                  ...prev,
                  treatment_status: item.value,
                }));
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
              value={currentMedicalCondition.allergies}
              onChangeText={(item: string) => {
                setCurrentMedicalCondition((prev) => ({
                  ...prev,
                  allergies: item,
                }));
              }}
              autoCorrect={false}
              autoCapitalize="none"
            />

            <Pressable
              style={
                currentMedicalCondition.condition.length === 0
                  ? styles.button_disabled
                  : styles.button
              }
              onPress={addMedicalHistory}
              disabled={currentMedicalCondition.condition.length === 0}
            >
              <Text style={styles.buttonText}>Add</Text>
            </Pressable>
          </>
        </>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
