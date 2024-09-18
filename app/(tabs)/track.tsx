import React, { useRef, useCallback, useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Text, Button } from "react-native";
import {
  ExpandableCalendar,
  AgendaList,
  CalendarProvider,
} from "react-native-calendars";
import testIDs from "../_calendar_files/testIDs";
import { getMarkedDates } from "../_calendar_files/agendaItems";
import AgendaItem from "../_calendar_files/AgendaItem";
import { getTheme, themeColor, lightThemeColor } from "../theme";
import Dialog from "react-native-dialog";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";

const leftArrowIcon = require("../img/previous.png");
const rightArrowIcon = require("../img/next.png");

export default function TabTwoScreen() {
  const marked = useRef(getMarkedDates());
  const theme = useRef(getTheme());
  const [ITEMS, setITEMS] = useState([]);
  const todayBtnTheme = useRef({
    todayButtonTextColor: themeColor,
  });
  const [visible, setVisible] = useState(false);
  const [formTab, setFormTab] = useState("sleep");
  const [sleepTime, setSleepTime] = useState(new Date());
  const [wakeupTime, setWakeupTime] = useState(new Date());
  const [water, setWater] = useState("");
  const [waterType, setWaterType] = useState("");
  const [isWaterTypeFocus, setIsWaterTypeFocus] = useState(false);
  const [weightType, setWeightType] = useState("");
  const [weight, setWeight] = useState("");
  const [isWeightTypeFocus, setIsWeightTypeFocus] = useState(false);

  const waterTypeOptions = [
    { label: "Cups", value: "cups" },
    { label: "Litres", value: "litres" },
  ];
  const weightTypeOptions = [
    { label: "lbs", value: "lbs" },
    { label: "kg", value: "kg" },
  ];

  useEffect(() => {
    // const items = [];
    // setITEMS(items);
  }, []);

  const onDateChanged = (date: string) => {
    console.log("ExpandableCalendarScreen onDateChanged: ", date);
  };

  const onMonthChange = (date: any) => {
    console.log("ExpandableCalendarScreen onMonthChange: ", date);
  };

  const renderItem = useCallback(({ item }: any) => {
    return <AgendaItem item={item} />;
  }, []);

  const showForm = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleSubmission = () => {
    setVisible(false);
  };

  return (
    <CalendarProvider
      date={`${new Date()}`}
      showTodayButton
      theme={todayBtnTheme.current}
      onDateChanged={onDateChanged}
      onMonthChange={onMonthChange}
      // disabledOpacity={0.6}
      // todayBottomMargin={16}
    >
      <ExpandableCalendar
        testID={testIDs.expandableCalendar.CONTAINER}
        disablePan
        hideKnob
        initialPosition={ExpandableCalendar.positions.OPEN}
        calendarStyle={styles.calendar}
        headerStyle={styles.header} // for horizontal only
        theme={theme.current}
        firstDay={1}
        markedDates={marked.current}
        leftArrowImageSource={leftArrowIcon}
        rightArrowImageSource={rightArrowIcon}
        // horizontal={false}
        // hideArrows
        // disableWeekScroll
        // disableAllTouchEventsForDisabledDays
        // animateScroll={false}
        // closeOnDayPress={false}
      />
      <AgendaList
        sections={ITEMS}
        renderItem={renderItem}
        sectionStyle={styles.section}
        // scrollToNextEvent={false}
        // dayFormat={'yyyy-MM-d'}
      />
      {/* Pop up */}
      <View>
        <Pressable style={styles.button} onPress={showForm}>
          <Text style={styles.buttonText}>Add</Text>
        </Pressable>
        <Dialog.Container visible={visible}>
          <Dialog.Title>Account delete</Dialog.Title>
          <>
            <View style={styles.formTabs}>
              <Button onPress={() => setFormTab("sleep")} title="Sleep" />
              <Button onPress={() => setFormTab("diet")} title="Diet" />
              <Button onPress={() => setFormTab("water")} title="Water" />
              <Button onPress={() => setFormTab("weight")} title="Weight" />
            </View>
            <View style={styles.formTabsBody}>
              {formTab === "sleep" && (
                <>
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
                </>
              )}
              {formTab === "diet" && (
                <Dialog.Description>In diet tab</Dialog.Description>
              )}
              {formTab === "water" && (
                <>
                  <Dialog.Input
                    style={styles.input}
                    placeholder="Add water here..."
                    value={water}
                    onChangeText={setWater}
                    autoCorrect={false}
                    autoCapitalize="none"
                  ></Dialog.Input>
                  <Dropdown
                    style={[
                      styles.dropdown,
                      isWaterTypeFocus && { borderColor: "blue" },
                    ]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    iconStyle={styles.iconStyle}
                    data={waterTypeOptions}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={
                      !isWaterTypeFocus ? "Select Water Unit" : "..."
                    }
                    value={waterType}
                    onFocus={() => setIsWaterTypeFocus(true)}
                    onBlur={() => setIsWaterTypeFocus(false)}
                    onChange={(item: any) => {
                      setWaterType(item.value);
                      setIsWaterTypeFocus(false);
                    }}
                    renderLeftIcon={() => (
                      <AntDesign
                        style={styles.icon}
                        color={isWaterTypeFocus ? "blue" : "black"}
                        name="Safety"
                        size={20}
                      />
                    )}
                  />
                </>
              )}
              {formTab === "weight" && (
                <>
                  <Dialog.Input
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
                    placeholder={
                      !isWeightTypeFocus ? "Select Weight Unit" : "..."
                    }
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
                </>
              )}
            </View>
          </>
          <Dialog.Button label="Cancel" onPress={handleCancel} />
          <Dialog.Button label="Add" onPress={handleSubmission} />
        </Dialog.Container>
      </View>
    </CalendarProvider>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
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
  icon: {
    marginRight: 5,
  },
  formTabsBody: {
    backgroundColor: "#808080",
  },
  formTabs: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
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
  calendar: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  header: {
    backgroundColor: "lightgrey",
    marginTop: 50,
  },
  section: {
    backgroundColor: lightThemeColor,
    color: "grey",
    textTransform: "capitalize",
  },
});
