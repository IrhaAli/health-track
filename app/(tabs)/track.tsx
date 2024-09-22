import React, { useRef, useCallback, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Text,
  Button,
  TouchableOpacity,
  Image,
  Alert,
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
import { getAuth } from "firebase/auth";
import { router } from "expo-router";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const leftArrowIcon = require("../img/previous.png");
const rightArrowIcon = require("../img/next.png");

export default function TabTwoScreen() {
  const storage = getStorage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sleepTime, setSleepTime] = useState(new Date());
  const [sleepDuration, setSleepDuration] = useState(0);
  const [wakeupTime, setWakeupTime] = useState(new Date());
  const [mealTime, setMealTime] = useState(new Date());
  const [sleepDate, setSleepDate] = useState(new Date());
  const marked = useRef(getMarkedDates());
  const theme = useRef(getTheme());
  const [ITEMS, setITEMS] = useState([]);
  const todayBtnTheme = useRef({
    todayButtonTextColor: themeColor,
  });
  const [visible, setVisible] = useState(false);
  const [formTab, setFormTab] = useState("sleep");
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

  const uploadImage = async (reference: string) => {
    const response = await fetch(
      reference === "weight" ? imageWeightUri : imageFoodUri
    );
    const blob = await response.blob();
    let refer = ref(storage, `${reference}/${new Date().getTime()}`);
    return uploadBytes(refer, blob)
      .then((snapshot) => {
        return getDownloadURL(snapshot.ref);
      })
      .then((downloadUrl) => {
        return downloadUrl;
      });
  };

  const toggleCameraFacing = () => {
    setCameraSide((current) =>
      current === CameraType.front ? CameraType.back : CameraType.front
    );
  };

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

  useEffect(() => {
    setSleepDuration(calculateSleepDuration());
  }, [sleepDate, sleepTime, wakeupTime]);

  const onDateChanged = (date: string) => {
    const dateChosen = new Date(date);
    const todayDate = new Date();
    const currentHours = todayDate.getUTCHours();
    const currentMinutes = todayDate.getUTCMinutes();
    const currentSeconds = todayDate.getUTCSeconds();
    const dateChosenWithTime = new Date(
      Date.UTC(
        dateChosen.getUTCFullYear(),
        dateChosen.getUTCMonth(),
        dateChosen.getUTCDate(),
        currentHours,
        currentMinutes,
        currentSeconds
      )
    );
    setCurrentDate(dateChosenWithTime);
    setSleepDate(new Date(dateChosen.setDate(dateChosen.getDate() - 1)));
    setSleepTime(dateChosenWithTime);
    setWakeupTime(dateChosenWithTime);
    setMealTime(dateChosenWithTime);
  };

  const calculateSleepDuration = () => {
    const currentHours = sleepTime.getUTCHours();
    const currentMinutes = sleepTime.getUTCMinutes();
    const currentSeconds = sleepTime.getUTCSeconds();
    const sleepDatePickTime = new Date(
      Date.UTC(
        sleepDate.getUTCFullYear(),
        sleepDate.getUTCMonth(),
        sleepDate.getUTCDate(),
        currentHours,
        currentMinutes,
        currentSeconds
      )
    );
    const sleepTimeMs = sleepDatePickTime.getTime();
    const wakeupTimeMs = wakeupTime.getTime();
    const differenceMs = wakeupTimeMs - sleepTimeMs;
    const differenceMinutes = differenceMs / (1000 * 60);
    return Math.ceil(differenceMinutes);
  };

  const onMonthChange = (date: any) => {
    // console.log("ExpandableCalendarScreen onMonthChange: ", date);
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

  const convertMinutesToHoursAndMinutes = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours} hours and ${minutes} minutes`;
  };

  const handleSubmission = async () => {
    const userId = getAuth().currentUser?.uid || "PHCJD511ukbTHQfVXPu26N8rzqg1";
    if (!userId) {
      router.push({
        pathname: "/(signup)",
      });
    }

    if (formTab === "sleep") {
      const userSleepData = {
        user_id: userId,
        bed_time: sleepTime,
        wakeup_time: wakeupTime,
        sleep_quality: sleepQuality,
        sleep_duration: sleepDuration,
      };
      await addDoc(collection(db, "sleep_tracking"), userSleepData);
    } else if (formTab === "diet") {
      const userDietData = {
        user_id: userId,
        date: mealTime,
        meal_picture: await uploadImage("diet"),
      };
      await addDoc(collection(db, "diet_tracking"), userDietData);
    } else if (formTab === "water") {
      const conversionRate: Record<string, number> = {
        cups: 250,
      };
      const intake_amount =
        waterType !== "millilitres"
          ? parseFloat(water) *
            (waterType.length === 0 ? 1 : conversionRate[waterType])
          : water;
      const userWaterData = {
        user_id: userId,
        date: currentDate,
        intake_amount,
        measurement_unit: waterType.length === 0 ? "millilitres" : waterType,
      };
      await addDoc(collection(db, "water_tracking"), userWaterData);
    } else if (formTab === "weight") {
      const conversionRate: Record<string, number> = {
        lbs: 0.453592,
      };
      const convertedWeight =
        weightType !== "kg"
          ? parseFloat(weight) *
            (weightType.length === 0 ? 1 : conversionRate[weightType])
          : weight;
      const userWeightData = {
        user_id: userId,
        date: currentDate,
        weight: convertedWeight,
        measurement_unit: weightType.length === 0 ? "kg" : weightType,
        picture: await uploadImage("weight"),
      };
      await addDoc(collection(db, "weight_tracking"), userWeightData);
    }
    setVisible(false);
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
        date={`${currentDate}`}
        showTodayButton
        theme={todayBtnTheme.current}
        onDateChanged={(date) => onDateChanged(date)}
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
            <Dialog.Title>
              Add{" "}
              {`${currentDate.toLocaleString("default", {
                month: "short",
              })}, ${currentDate.getDate()}`}
              's Data
            </Dialog.Title>
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
                    <Text>Last Night's Sleep</Text>
                    <DateTimePicker
                      mode="date"
                      value={sleepDate}
                      onChange={(event: any, value: Date | undefined) =>
                        setSleepDate(value || currentDate)
                      }
                    />
                    <DateTimePicker
                      mode="time"
                      value={sleepTime}
                      onChange={(event: any, value: Date | undefined) =>
                        setSleepTime(value || currentDate)
                      }
                    />
                    <Text>Wakeup Time</Text>
                    <DateTimePicker
                      mode="time"
                      value={wakeupTime}
                      onChange={(event: any, value: Date | undefined) =>
                        setWakeupTime(value || currentDate)
                      }
                    />
                    <Text>Sleep Quality: {sleepQuality}</Text>
                    <Slider
                      minimumValue={1}
                      maximumValue={5}
                      step={1}
                      onValueChange={(value: number) => setSleepQuality(value)}
                    />
                    <Text>
                      Total Sleeping Hours:{" "}
                      {convertMinutesToHoursAndMinutes(sleepDuration)}
                    </Text>
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
                          height={200}
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
                    <Text>Time of Meal</Text>
                    <DateTimePicker
                      mode="time"
                      value={mealTime}
                      onChange={(event: any, value: Date | undefined) =>
                        setMealTime(value || currentDate)
                      }
                    />
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
