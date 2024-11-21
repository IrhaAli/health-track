import React, { useState, useEffect } from "react";
import { StyleSheet, View, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native";
import { router } from "expo-router";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Surface, Text, Button, TextInput, Card, IconButton, useTheme } from 'react-native-paper';

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
  const theme = useTheme();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const [currentMedicalCondition, setCurrentMedicalCondition] = useState<Item>(emptyCondition);
  const [isConditionFocus, setIsConditionFocus] = useState(false);
  const [isTreatmentStatusFocus, setIsTreatmentStatusFocus] = useState(false);

  const conditionOptions = [
    { label: "Heart Condition", value: "heart_condition" },
  ];

  const treatmentStatusOptions = [
    { label: "Taking Medication", value: "taking_medication" },
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

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setCurrentMedicalCondition(prev => ({
        ...prev,
        diagnosis_date: selectedDate
      }));
    }
  };

  return (
    <Surface style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="headlineMedium" style={styles.title}>Medical History</Text>
        <View style={styles.content}>
          {medicalHistory.map((item: any, index: number) => {
            return !item.is_deleted && (
              <Card key={index} style={styles.card}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Text variant="titleMedium">Condition #{index + 1}</Text>
                    <IconButton
                      icon="delete"
                      mode="contained-tonal"
                      onPress={() => removeMedicalHistory(index)}
                    />
                  </View>
                  <Text variant="bodyMedium">Condition: {item.condition}</Text>
                  <Text variant="bodyMedium">
                    Diagnosis Date: {new Date(item.diagnosis_date).toLocaleDateString()}
                  </Text>
                  <Text variant="bodyMedium">Treatment Status: {item.treatment_status}</Text>
                  <Text variant="bodyMedium">Allergies: {item.allergies}</Text>
                </Card.Content>
              </Card>
            );
          })}

          <Card style={styles.inputCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>Add New Condition</Text>
              
              <Text variant="bodyMedium">Condition</Text>
              <Dropdown
                style={[styles.dropdown, isConditionFocus && { borderColor: theme.colors.primary }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={conditionOptions}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isConditionFocus ? "Select a Condition" : "..."}
                value={currentMedicalCondition.condition}
                onFocus={() => setIsConditionFocus(true)}
                onBlur={() => setIsConditionFocus(false)}
                onChange={(item) => {
                  setCurrentMedicalCondition((prev) => ({
                    ...prev,
                    condition: item.value,
                  }));
                  setIsConditionFocus(false);
                }}
              />

              <Text variant="bodyMedium" style={styles.inputLabel}>Diagnosis Date</Text>
              <Button
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
              >
                {currentMedicalCondition.diagnosis_date.toLocaleDateString()}
              </Button>
              
              {showDatePicker && (
                <DateTimePicker
                  value={currentMedicalCondition.diagnosis_date}
                  mode="date"
                  onChange={onDateChange}
                />
              )}

              <Text variant="bodyMedium" style={styles.inputLabel}>Treatment Status</Text>
              <Dropdown
                style={[styles.dropdown, isTreatmentStatusFocus && { borderColor: theme.colors.primary }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={treatmentStatusOptions}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isTreatmentStatusFocus ? "Treatment Status" : "..."}
                value={currentMedicalCondition.treatment_status}
                onFocus={() => setIsTreatmentStatusFocus(true)}
                onBlur={() => setIsTreatmentStatusFocus(false)}
                onChange={(item) => {
                  setCurrentMedicalCondition((prev) => ({
                    ...prev,
                    treatment_status: item.value,
                  }));
                  setIsTreatmentStatusFocus(false);
                }}
              />

              <TextInput
                label="Allergies"
                mode="outlined"
                style={styles.input}
                placeholder="Any allergies..."
                value={currentMedicalCondition.allergies}
                onChangeText={(text) => {
                  setCurrentMedicalCondition((prev) => ({
                    ...prev,
                    allergies: text,
                  }));
                }}
              />

              <Button
                mode="contained"
                onPress={addMedicalHistory}
                disabled={currentMedicalCondition.condition.length === 0}
                style={styles.addButton}
              >
                Add Condition
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  content: {
    gap: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputCard: {
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  dropdown: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  input: {
    marginTop: 8,
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
  },
  dateButton: {
    marginBottom: 16,
  },
  addButton: {
    marginTop: 8,
  }
});
