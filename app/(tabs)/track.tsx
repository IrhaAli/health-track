import React, { useRef, useCallback, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Text,
  Button,
  TouchableOpacity,
  Image,
} from "react-native";
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
import Slider from "@react-native-community/slider";
import { useCameraPermissions } from "expo-camera";
import { Camera, CameraType } from "expo-camera/legacy";

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
  const [sleepQuality, setSleepQuality] = useState(0);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraSide, setCameraSide] = useState(CameraType.back);
  const [showCamera, setShowCamera] = useState(false);
  const [imageFoodUri, setImageFoodUri] = useState(null);
  const [imageWeightUri, setImageWeightUri] = useState(null);
  const cameraRef = useRef<Camera | null>(null);
  const [timer, setTimer] = useState("");

  function toggleCameraFacing() {
    setCameraSide((current) =>
      current === CameraType.front ? CameraType.back : CameraType.front
    );
  }

  const waterTypeOptions = [
    { label: "Cups", value: "cups" },
    { label: "Millilitres", value: "millilitres" },
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

  const clearFields = () => {
    setSleepQuality(0);
    setWater("");
    setWaterType("");
    setWeight("");
    setWeightType("");
    setVisible(false);
  };

  const handleCancel = () => {
    clearFields();
  };

  const handleSubmission = () => {
    setVisible(false);
    // Add all data
    // ...
    clearFields();
  };

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  console.log(timer);

  const takePhoto = async () => {
    if (formTab === "weight") {
      let countdown = 5;
      let photoCountdown = setInterval(async () => {
        setTimer(`${countdown}`);
        countdown--;
        if (countdown <= 0) {
          const data: any = await cameraRef?.current?.takePictureAsync(
            undefined
          );
          setImageWeightUri(data.uri);
          setTimer("");
          clearInterval(photoCountdown);
          setShowCamera(false);
          setVisible(true);
        }
      }, 1000);
    } else {
      const data: any = await cameraRef?.current?.takePictureAsync(undefined);
      setImageFoodUri(data.uri);
      setTimer("");
      setShowCamera(false);
      setVisible(true);
    }
  };

  return (
    <>
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
                    <Text>Sleep Qualityl: {sleepQuality}</Text>
                    <Slider
                      minimumValue={1}
                      maximumValue={5}
                      step={1}
                      onValueChange={(value: number) => setSleepQuality(value)}
                    />
                  </>
                )}
                {formTab === "diet" && (
                  <>
                    {!imageFoodUri ? (
                      <Pressable
                        style={styles.button}
                        onPress={() => {
                          setShowCamera(true);
                          setVisible(false);
                        }}
                      >
                        <Text style={styles.buttonText}>Add Picture</Text>
                      </Pressable>
                    ) : (
                      <>
                        <Image
                          source={{
                            uri: imageFoodUri,
                          }}
                          width={100}
                          height={undefined}
                          resizeMode="contain"
                        />
                        <Pressable
                          onPress={() => {
                            setImageFoodUri(null);
                          }}
                        >
                          <Text style={styles.buttonText}>X</Text>
                        </Pressable>
                      </>
                    )}
                  </>
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
                    {!imageWeightUri ? (
                      <Pressable
                        style={styles.button}
                        onPress={() => {
                          setShowCamera(true);
                          setVisible(false);
                        }}
                      >
                        <Text style={styles.buttonText}>Add Picture</Text>
                      </Pressable>
                    ) : (
                      <>
                        <Image
                          source={{
                            uri: imageWeightUri,
                          }}
                          width={100}
                          height={200}
                          resizeMode="contain"
                        />
                        <Pressable
                          onPress={() => {
                            setImageWeightUri(null);
                          }}
                        >
                          <Text style={styles.buttonText}>X</Text>
                        </Pressable>
                      </>
                    )}
                  </>
                )}
              </View>
            </>
            <Dialog.Button label="Cancel" onPress={handleCancel} />
            <Dialog.Button label="Add" onPress={handleSubmission} />
          </Dialog.Container>
        </View>
      </CalendarProvider>
      {showCamera && (
        <View style={[styles.container, styles.cameraContainer]}>
          <Camera
            style={styles.camera}
            type={cameraSide}
            // ref={(ref: any)=> setNatCamera(ref)}
            ref={cameraRef}
          >
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={toggleCameraFacing}
              >
                <Text style={styles.text}>Flip Camera</Text>
                <Text style={styles.text}>{timer}</Text>
              </TouchableOpacity>
              <Button
                onPress={() => {
                  setShowCamera(false);
                  setVisible(true);
                }}
                title="Cancel"
              />
              <Button onPress={takePhoto} title="Take Photo" />
            </View>
          </Camera>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  cameraContainer: {
    position: "absolute",
    height: "100%",
    width: "100%",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  cameraButton: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
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
