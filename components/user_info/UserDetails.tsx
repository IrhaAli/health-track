import React, { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Surface,
  Text,
  TextInput,
  useTheme,
  Button,
  Portal,
  Modal,
  Title,
} from "react-native-paper";

export default function UserDetails({
  userDetails,
  setUserDetails,
  isSignUpPage,
}: any) {
  const theme = useTheme();
  const [measurementType, setMeasurementType] = useState("cm");
  const [weightType, setWeightType] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");

  const [showWakeupPicker, setShowWakeupPicker] = useState(false);
  const [showSleepPicker, setShowSleepPicker] = useState(false);
  const [showDOBPicker, setShowDOBPicker] = useState(false);

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

  const updateUserDetails = (value: any, key: string) => {
    setUserDetails((prev: any) => ({ ...prev, [key]: value }));
  };

  const onTimeChange = (event: any, selectedDate: Date | undefined, timeType: string) => {
    if (timeType === 'wakeup') {
      setShowWakeupPicker(false);
      if (selectedDate) {
        updateUserDetails(selectedDate, "wakeupTime");
      }
    } else if (timeType === 'sleep') {
      setShowSleepPicker(false);
      if (selectedDate) {
        updateUserDetails(selectedDate, "sleepTime");
      }
    } else if (timeType === 'dob') {
      setShowDOBPicker(false);
      if (selectedDate) {
        updateUserDetails(selectedDate, "dob");
      }
    }
  };

  return (
    <Surface style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Title style={styles.title}>Background Information</Title>
        <View style={styles.inputView}>
          {isSignUpPage && (
            <>
              <TextInput
                mode="outlined"
                label="Full Name"
                value={userDetails.fullName}
                onChangeText={(value) => updateUserDetails(value, "fullName")}
                autoCorrect={false}
                autoCapitalize="none"
                style={styles.input}
              />

              <Button 
                mode="outlined"
                onPress={() => setShowDOBPicker(true)}
                style={styles.dateButton}
              >
                {userDetails.dob ? userDetails.dob.toLocaleDateString() : 'Select Date of Birth'}
              </Button>

              {showDOBPicker && (
                <DateTimePicker
                  mode="date"
                  value={userDetails.dob || new Date()}
                  onChange={(event, date) => onTimeChange(event, date, 'dob')}
                />
              )}

              <Dropdown
                style={[styles.dropdown, isGenderFocus && { borderColor: theme.colors.primary }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={genderOptions}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isGenderFocus ? "Select Gender" : "..."}
                value={userDetails.gender}
                onFocus={() => setIsGenderFocus(true)}
                onBlur={() => setIsGenderFocus(false)}
                onChange={(item) => {
                  updateUserDetails(item.value, "gender");
                  setIsGenderFocus(false);
                }}
              />

              {measurementType === "cm" ? (
                <TextInput
                  mode="outlined"
                  label="Height (cm)"
                  value={userDetails.height}
                  onChangeText={(value) => updateUserDetails(value, "height")}
                  keyboardType="numeric"
                  style={styles.input}
                />
              ) : (
                <View style={styles.feetInchContainer}>
                  <TextInput
                    mode="outlined"
                    label="Feet"
                    value={feet}
                    onChangeText={setFeet}
                    keyboardType="numeric"
                    style={[styles.input, styles.feetInput]}
                  />
                  <TextInput
                    mode="outlined"
                    label="Inches"
                    value={inches}
                    onChangeText={setInches}
                    keyboardType="numeric"
                    style={[styles.input, styles.inchesInput]}
                  />
                </View>
              )}

              <Dropdown
                style={[styles.dropdown, isMeasurementTypeFocus && { borderColor: theme.colors.primary }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={measurementTypeOptions}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select Measurement Unit"
                value={measurementType}
                onFocus={() => setIsMeasurementTypeFocus(true)}
                onBlur={() => setIsMeasurementTypeFocus(false)}
                onChange={(item) => {
                  setMeasurementType(item.value);
                  setIsMeasurementTypeFocus(false);
                }}
              />

              <TextInput
                mode="outlined"
                label="Weight"
                value={userDetails.weight}
                onChangeText={(value) => updateUserDetails(value, "weight")}
                keyboardType="numeric"
                style={styles.input}
              />

              <Dropdown
                style={[styles.dropdown, isWeightTypeFocus && { borderColor: theme.colors.primary }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={weightTypeOptions}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select Weight Unit"
                value={weightType}
                onFocus={() => setIsWeightTypeFocus(true)}
                onBlur={() => setIsWeightTypeFocus(false)}
                onChange={(item) => {
                  setWeightType(item.value);
                  setIsWeightTypeFocus(false);
                }}
              />
            </>
          )}

          <Dropdown
            style={[styles.dropdown, isBodyTypeFocus && { borderColor: theme.colors.primary }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={bodyTypeOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select Body Type"
            value={userDetails.bodyType}
            onFocus={() => setIsBodyTypeFocus(true)}
            onBlur={() => setIsBodyTypeFocus(false)}
            onChange={(item) => {
              updateUserDetails(item.value, "bodyType");
              setIsBodyTypeFocus(false);
            }}
          />

          <Dropdown
            style={[styles.dropdown, isActivityFocus && { borderColor: theme.colors.primary }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={activityTypeOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select Activity Type"
            value={userDetails.activityType}
            onFocus={() => setIsActivityFocus(true)}
            onBlur={() => setIsActivityFocus(false)}
            onChange={(item) => {
              updateUserDetails(item.value, "activityType");
              setIsActivityFocus(false);
            }}
          />

          <Text variant="bodyMedium" style={styles.inputLabel}>Wake up time</Text>
          <Button 
            mode="outlined"
            onPress={() => setShowWakeupPicker(true)}
            style={styles.dateButton}
          >
            {userDetails.wakeupTime ? userDetails.wakeupTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Select Wakeup Time'}
          </Button>

          {showWakeupPicker && (
            <DateTimePicker
              mode="time"
              value={userDetails.wakeupTime || new Date()}
              onChange={(event, date) => onTimeChange(event, date, 'wakeup')}
            />
          )}

          <Text variant="bodyMedium" style={styles.inputLabel}>Sleep time</Text>
          <Button 
            mode="outlined"
            onPress={() => setShowSleepPicker(true)}
            style={styles.dateButton}
          >
            {userDetails.sleepTime ? userDetails.sleepTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Select Sleep Time'}
          </Button>

          {showSleepPicker && (
            <DateTimePicker
              mode="time"
              value={userDetails.sleepTime || new Date()}
              onChange={(event, date) => onTimeChange(event, date, 'sleep')}
            />
          )}

          <Dropdown
            style={[styles.dropdown, isHealthGoalTypeFocus && { borderColor: theme.colors.primary }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={healthGoalOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select Health Goal"
            value={userDetails.healthGoal}
            onFocus={() => setIsHealthGoalTypeFocus(true)}
            onBlur={() => setIsHealthGoalTypeFocus(false)}
            onChange={(item) => {
              updateUserDetails(item.value, "healthGoal");
              setIsHealthGoalTypeFocus(false);
            }}
          />
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
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  inputView: {
    gap: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  feetInchContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  feetInput: {
    flex: 1,
  },
  inchesInput: {
    flex: 1,
  },
  dropdown: {
    height: 56,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  dateButton: {
    marginVertical: 8,
  },
  inputLabel: {
    marginBottom: 8,
  }
});
