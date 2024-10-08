import React, { useRef, useCallback, useState, useEffect } from "react";
import { StyleSheet, View, Pressable, Text, Button, TouchableOpacity, Image, Alert } from "react-native";
import { ExpandableCalendar, AgendaList, CalendarProvider } from "react-native-calendars";
import testIDs from "../../app/_calendar_files/testIDs";
import AgendaItem from "../../app/_calendar_files/AgendaItem";
import { getTheme, themeColor, lightThemeColor } from "../../app/theme";
import Dialog from "react-native-dialog";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import Slider from "@react-native-community/slider";
import { useCameraPermissions } from "expo-camera";
import { Camera, CameraType } from "expo-camera/legacy";
import { getAuth } from "firebase/auth";
import { router } from "expo-router";
import { setDoc, addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Local Components Start.
import TrackSleepForm from "./trackSleepForm";
import TrackWaterForm from "./trackWaterForm";
import TrackDialog from "./trackDialog";
// Local Components End.


const leftArrowIcon = require("../../app/img/previous.png");
const rightArrowIcon = require("../../app/img/next.png");

export default function TrackComponent() {
  console.log('A1 rendered');
  const userId = getAuth().currentUser?.uid || "PHCJD511ukbTHQfVXPu26N8rzqg1";
  const [ITEMS, setITEMS] = useState({
    water: [],
    weight: [],
    diet: [],
    sleep: [],
    update: { water: false, weight: false, diet: false, sleep: false },
  });
  const [visible, setVisible] = useState(false);
  const [formTab, setFormTab] = useState("sleep");
  const [loadingData, setLoadingData] = useState(false);
  const [currentDate, setCurrentDate] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`);
  const [sleepTime, setSleepTime] = useState(new Date());
  const [sleepDuration, setSleepDuration] = useState(0);
  const [sleepDate, setSleepDate] = useState(new Date());
  const [sleepQuality, setSleepQuality] = useState(0);
  const [wakeupTime, setWakeupTime] = useState(new Date());
  const [mealTime, setMealTime] = useState(new Date());
  const [water, setWater] = useState("");
  const [waterType, setWaterType] = useState("millilitres");
  const [weightType, setWeightType] = useState("kg");
  const [weight, setWeight] = useState("");
  const [cameraSide, setCameraSide] = useState(CameraType.back);
  const [showCamera, setShowCamera] = useState(false);
  const [imageFoodUri, setImageFoodUri] = useState(null);
  const [imageWeightUri, setImageWeightUri] = useState(null);
  const [timer, setTimer] = useState("");

  const storage = getStorage();
  const theme = useRef(getTheme());
  
  const todayBtnTheme = useRef({
    todayButtonTextColor: themeColor,
    selectedDayBackgroundColor: "red",
  });
  const cameraRef = useRef<Camera | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const waterTypeOptions = [
    { label: "Cups", value: "cups" },
    { label: "Millilitres", value: "millilitres" },
    { label: "Liters", value: "liters" },
  ];
  const weightTypeOptions = [
    { label: "lbs", value: "lbs" },
    { label: "kg", value: "kg" },
  ];

  useEffect(() => {
    setSleepDuration(calculateSleepDuration());
  }, [sleepDate, sleepTime, wakeupTime]);

  useEffect(() => {
    console.log('visible', visible);
  }, [visible]);

  const renderItem = useCallback(({ item }: any) => {
    return <AgendaItem item={item} />;
  }, []);

  const getData = async (collectionName: string, date: string) => {
    const startDate = new Date(new Date(date).setHours(0, 0, 0, 0));
    const endDate = new Date(new Date(date).setHours(23, 59, 59, 999));
    const whereDate =
      collectionName === "sleep_tracking" ? "wakeup_time" : "date";
    const collectionData = query(
      collection(db, collectionName),
      where("user_id", "==", userId),
      where(whereDate, ">=", startDate),
      where(whereDate, "<=", endDate)
    );
    const docSnap = await getDocs(collectionData);
    const docData: any[] = [];
    docSnap.forEach((item) => docData.push({ ...item.data() }));

    return docData;
  };

  const addItems = (data: any, dataType: string, date: Date) => {
    let item: any = [];
    if (dataType === "water") {
      data.forEach((waterIntake: any) => {
        setWater(waterIntake.intake_amount);
        setWaterType(waterIntake.measurement_unit);
        item.push({
          title: date,
          data: [
            {
              hour: `${waterIntake.intake_amount}`,
              duration: `${waterIntake.measurement_unit}`,
              title: "Water Intake",
            },
          ],
          // id: waterIntake.id,
        });
      });
    } else if (dataType === "diet") {
      data.forEach((meal: any) => {
        const time = new Date(meal.date.toDate());
        item.push({
          title: date,
          data: [
            {
              hour: `${time.getHours() % 12}:${time.getMinutes()} ${
                time.getHours() < 12 ? "AM" : "PM"
              }`,
              title: "Meals",
            },
          ],
          // id: meal.id,
        });
      });
    } else if (dataType === "weight") {
      data.forEach((weightAmount: any) => {
        setWeight(weightAmount.weight);
        setWeightType(weightAmount.measurement_unit);
        item.push({
          title: date,
          data: [
            {
              hour: `${weightAmount.weight}`,
              duration: `${weightAmount.measurement_unit}`,
              title: "Weight",
            },
          ],
          // id: weightAmount.id,
        });
      });
    } else if (dataType === "sleep") {
      data.forEach((sleepInfo: any) => {
        setSleepDate(new Date(sleepInfo.bed_time.toDate()));
        setSleepTime(new Date(sleepInfo.bed_time.toDate()));
        setWakeupTime(new Date(sleepInfo.wakeup_time.toDate()));
        setSleepQuality(sleepInfo.sleep_quality);
        item.push({
          title: date,
          data: [
            {
              hour: `${Math.floor(sleepInfo.sleep_duration / 60)} hrs ${
                sleepInfo.sleep_duration % 60
              } mins`,
              duration: `${sleepInfo.sleep_quality}`,
              title: "Sleep",
            },
          ],
          // id: sleepInfo.id,
        });
      });
    }
    return item;
  };

  const dateChosenWithTime = (date: string) => {
    const dateChosen = new Date(date);
    const todayDate = new Date();
    const currentHours = todayDate.getUTCHours();
    const currentMinutes = todayDate.getUTCMinutes();
    const currentSeconds = todayDate.getUTCSeconds();
    return new Date(
      Date.UTC(
        dateChosen.getUTCFullYear(),
        dateChosen.getUTCMonth(),
        dateChosen.getUTCDate(),
        currentHours,
        currentMinutes,
        currentSeconds
      )
    );
  };

  const updateDataOnNewDate = async () => {
    setLoadingData(true);
    const date = `${currentDate}`;
    const dateWithTime = dateChosenWithTime(date);
    setITEMS({
      water: [],
      weight: [],
      diet: [],
      sleep: [],
      update: { water: false, weight: false, diet: false, sleep: false },
    });
    setMealTime(dateWithTime);
    const dietData = await getData("diet_tracking", date);
    const waterData = await getData("water_tracking", date);
    const weightData = await getData("weight_tracking", date);
    const sleepData = await getData("sleep_tracking", date);

    if (
      dietData.length > 0 ||
      waterData.length > 0 ||
      weightData.length > 0 ||
      sleepData.length > 0
    ) {
      setITEMS({
        diet: addItems(dietData, "diet", new Date(date)),
        water: addItems(waterData, "water", new Date(date)),
        weight: addItems(weightData, "weight", new Date(date)),
        sleep: addItems(sleepData, "sleep", new Date(date)),
        update: {
          diet: dietData.length !== 0,
          water: waterData.length !== 0,
          weight: weightData.length !== 0,
          sleep: sleepData.length !== 0,
        },
      });
    }

    if (sleepData.length === 0) {
      const dateChosen = new Date(date);
      setSleepDate(new Date(dateChosen.setDate(dateChosen.getDate() - 1)));
      setSleepTime(dateWithTime);
      setWakeupTime(dateWithTime);
    }
    setLoadingData(false);
    // console.log(dietData);
    // console.log(waterData);
    // console.log(weightData);
    // console.log(sleepData);
    // console.log(date);
  };

  useEffect(() => {
    console.log("useEffect", currentDate);
  }, [currentDate]);
  
  console.log('component rendering');
  
  const onDateChanged = async (date: string, previousDate: string) => {
    if (date === previousDate) {
      console.log("SAME DATE YOU IDIOT");
      return;
    }
    
    // const dateWithTime = dateChosenWithTime(date);
    updateDataOnNewDate();
    setCurrentDate(date);
  }

  const clearFields = () => {
    setSleepQuality(0);
    setWater("");
    setWeight("");
    setImageFoodUri(null);
    setImageWeightUri(null);
    setVisible(false);
  };

  const calculateSleepDuration = () => {
    const timezoneOffsetMs = sleepTime.getTimezoneOffset() * 60 * 1000;
    let sleepTimeUTC = sleepTime;
    let wakeupTimeUTC = wakeupTime;

    if (timezoneOffsetMs > 0) {
      sleepTimeUTC = new Date(sleepTime.getTime() - timezoneOffsetMs);
      wakeupTimeUTC = new Date(wakeupTime.getTime() - timezoneOffsetMs);
    } else if (timezoneOffsetMs < 0) {
      sleepTimeUTC = new Date(sleepTime.getTime() + timezoneOffsetMs);
      wakeupTimeUTC = new Date(wakeupTime.getTime() + timezoneOffsetMs);
    }

    const currentHours = sleepTimeUTC.getUTCHours();
    const currentMinutes = sleepTimeUTC.getUTCMinutes();
    const currentSeconds = sleepTimeUTC.getUTCSeconds();

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
    const wakeupTimeMs = wakeupTimeUTC.getTime();
    const differenceMs = wakeupTimeMs - sleepTimeMs;
    const differenceMinutes = differenceMs / (1000 * 60);
    return Math.ceil(differenceMinutes);
  };

  const convertMinutesToHoursAndMinutes = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours} hours and ${minutes} minutes`;
  };

  const toggleCameraFacing = () => {
    setCameraSide((current) =>
      current === CameraType.front ? CameraType.back : CameraType.front
    );
  };

  const uploadImage = async (reference: string) => {
    const imageUri = reference === "weight" ? imageWeightUri : imageFoodUri;

    if (!imageUri) {
      throw new Error(`Invalid URI for reference: ${reference}`);
    }

    // const response = await fetch(reference === "weight" ? imageWeightUri : imageFoodUri);
    const response = await fetch(imageUri);

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

  const handleSubmission = async () => {
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
    } 
    else if (formTab === "diet") {
      if (!imageFoodUri) {
        Alert.alert("Please add a picture of your meal.");
        return;
      }
      const userDietData = {
        user_id: userId,
        date: mealTime,
        meal_picture: await uploadImage("diet"),
      };
      await addDoc(collection(db, "diet_tracking"), userDietData);
    } 
    else if (formTab === "water") {
      const conversionRate: Record<string, number> = {
        cups: 250,
        litres: 1000,
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
    } 
    else if (formTab === "weight") {
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
        picture: imageWeightUri ? await uploadImage("weight") : imageWeightUri,
      };
      await addDoc(collection(db, "weight_tracking"), userWeightData);
    }
    setVisible(false);
    clearFields();
  };

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
    console.log('component rendered in return'),
    <>
            <CalendarProvider
        date={currentDate}
        showTodayButton={false}
        theme={todayBtnTheme.current}
        onDateChanged={(date: any) => onDateChanged( date, currentDate )}
      >
        <ExpandableCalendar
          testID={"expandableCalendarContainer"}
          disabledByDefault={loadingData}
          disablePan
          hideKnob
          initialPosition={ExpandableCalendar.positions.OPEN}
          calendarStyle={styles.calendar}
          headerStyle={styles.header} // for horizontal only
          // theme={theme.current}
          firstDay={1}
          leftArrowImageSource={leftArrowIcon}
          rightArrowImageSource={rightArrowIcon}
          maxDate={`${new Date(new Date().setDate(new Date().getDate() - 1))}`}
          markedDates={{
            [currentDate]: {
              selected: true,
              selectedColor: "yellow",
              selectedTextColor: "black",
            },
          }}
        />
        <AgendaList
          sections={[
            ...ITEMS.sleep,
            ...ITEMS.water,
            ...ITEMS.diet,
            ...ITEMS.weight,
          ]}
          renderItem={renderItem}
          sectionStyle={styles.section}
          scrollToNextEvent={false}
        />
      </CalendarProvider>
      
      <TrackDialog currentDate={currentDate} userId={userId}></TrackDialog>

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
