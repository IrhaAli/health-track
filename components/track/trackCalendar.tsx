import React, { useRef, useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ExpandableCalendar, AgendaList, CalendarProvider, Calendar } from "react-native-calendars";
import AgendaItem from "../../app/_calendar_files/AgendaItem";
import { themeColor, lightThemeColor } from "../../app/theme";
import { getAuth } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentDate } from "@/store/trackSlice";
import { RootState } from "@/store/store";

// Local Components Start.
import TrackExpandableCalendar from "./trackExpandableCalendar";
import { color } from "@rneui/base";
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
    const [loadingData, setLoadingData] = useState(false);
    // const [currentDate, setCurrentDate] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`);
    const currentDate = useSelector((state: RootState) => state.track.currentDate);

    const [sleepTime, setSleepTime] = useState(new Date());
    const [sleepDate, setSleepDate] = useState(new Date());
    const [sleepQuality, setSleepQuality] = useState(0);
    const [wakeupTime, setWakeupTime] = useState(new Date());
    const dispatch = useDispatch();

    const todayBtnTheme = useRef({
        todayButtonTextColor: themeColor,
        selectedDayBackgroundColor: "red",
    });

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
                            hour: `${time.getHours() % 12}:${time.getMinutes()} ${time.getHours() < 12 ? "AM" : "PM"
                                }`,
                            title: "Meals",
                        },
                    ],
                    // id: meal.id,
                });
            });
        } else if (dataType === "weight") {
            data.forEach((weightAmount: any) => {
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
                            hour: `${Math.floor(sleepInfo.sleep_duration / 60)} hrs ${sleepInfo.sleep_duration % 60
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
    };

    console.log('component rendering');

    function formatDateToYYYYMMDD(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function subtractOneDay(date: string): Date {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() - 1);
        return newDate;
    }

    return (
        <>
            <Calendar
                initialDate={currentDate}
                minDate={`${new Date(currentDate).getFullYear()}-01-01`}
                maxDate={formatDateToYYYYMMDD(subtractOneDay(`${new Date()}`))}
                onDayPress={(day: any) => { dispatch(setCurrentDate(`${day.year}-${String(day.month).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`)) }}
                hideExtraDays={true}
                firstDay={1}
                renderHeader={(date: any) => { return <Text style={styles.calendarMonthYear}>{new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date)} {date.getFullYear()}</Text> }}
                style={{
                    marginTop: 45,
                    borderWidth: 1,
                    borderColor: 'gray'
                }}
                theme={{
                    backgroundColor: '#ffffff',
                    calendarBackground: '#ffffff',
                    textSectionTitleColor: '#b6c1cd',
                    textSectionTitleDisabledColor: '#d9e1e8',
                    selectedDayBackgroundColor: '#00adf5',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#00adf5',
                    dayTextColor: '#2d4150',
                    textDisabledColor: '#d9e1e8',
                    dotColor: '#00adf5',
                    selectedDotColor: '#ffffff',
                    arrowColor: 'blue',
                    disabledArrowColor: '#d9e1e8',
                    monthTextColor: 'blue',
                    indicatorColor: 'blue',
                    textDayFontFamily: 'monospace',
                    textMonthFontFamily: 'monospace',
                    textDayHeaderFontFamily: 'monospace',
                    textDayFontWeight: '300',
                    textMonthFontWeight: '700',
                    textDayHeaderFontWeight: '300',
                    textDayFontSize: 16,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 16,
                    'stylesheet.calendar.header': {
                        week: {
                            marginTop: 5,
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                        },
                        dayTextAtIndex0: {
                            color: 'red'
                        },
                        dayTextAtIndex6: {
                            color: 'blue'
                        }
                    }
                }}
                markedDates={{
                    [currentDate]: {
                        selected: true,
                        selectedColor: "red",
                        selectedTextColor: "white",
                    },
                }}
            />
            {/* <AgendaList
                    sections={[
                        ...ITEMS.sleep,
                        ...ITEMS.water,
                        ...ITEMS.diet,
                        ...ITEMS.weight,
                    ]}
                    renderItem={renderItem}
                    sectionStyle={styles.section}
                    scrollToNextEvent={false}
                /> */}
        </>
    );
}

const styles = StyleSheet.create({
    calendar: {
        // marginTop: 0
        // paddingLeft: 20,
        // paddingRight: 20,
    },
    calendarMonthYear: {
        fontWeight: '500',
        fontSize: 18
    },
    header: {
        backgroundColor: "lightgrey",
        // marginTop: 50,
    },
    section: {
        backgroundColor: lightThemeColor,
        color: "grey",
        textTransform: "capitalize",
    },
});
