import React, { useEffect, useState } from "react";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { StyleSheet, Platform, Pressable, View, ActivityIndicator } from "react-native";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useDispatch, useSelector } from "react-redux";
import { setHideDialog } from "@/store/trackDialogSlice";
import { AppDispatch, RootState } from "@/store/store";
import { Divider, Text, Button } from 'react-native-paper';
import { getAuth } from "firebase/auth";

export default function TrackSleepForm() {
    const dispatch = useDispatch<AppDispatch>();
    const currentDate = useSelector((state: RootState) => state.track.currentDate);
    const [sleepDateTime, setSleepDateTime] = useState(new Date(new Date(currentDate).setDate(new Date(currentDate).getDate() - 1)));
    const [wakeupTime, setWakeupTime] = useState(new Date(currentDate));
    const [sleepQuality, setSleepQuality] = useState(0);
    const [sleepDuration, setSleepDuration] = useState(0);
    const [showSleepDateSelector, setShowSleepDateSelector] = useState(false);
    const [showSleepTimeSelector, setShowSleepTimeSelector] = useState(false);
    const [showWakeupTimeSelector, setShowWakeupTimeSelector] = useState(false);
    const [loading, setLoading] = useState(false);
    const auth = getAuth();

    const convertMinutesToHoursAndMinutes = (totalMinutes: number): string =>
        `${Math.floor(totalMinutes / 60)} hours and ${totalMinutes % 60} minutes`;

    const calculateSleepDuration = () => {
        const timezoneOffsetMs = sleepDateTime.getTimezoneOffset() * 60 * 1000;
        let sleepTimeUTC = sleepDateTime;
        let wakeupTimeUTC = wakeupTime;

        if (timezoneOffsetMs > 0) {
            sleepTimeUTC = new Date(sleepDateTime.getTime() - timezoneOffsetMs);
            wakeupTimeUTC = new Date(wakeupTime.getTime() - timezoneOffsetMs);
        } else if (timezoneOffsetMs < 0) {
            sleepTimeUTC = new Date(sleepDateTime.getTime() + timezoneOffsetMs);
            wakeupTimeUTC = new Date(wakeupTime.getTime() + timezoneOffsetMs);
        }

        const currentHours = sleepTimeUTC.getUTCHours();
        const currentMinutes = sleepTimeUTC.getUTCMinutes();
        const currentSeconds = sleepTimeUTC.getUTCSeconds();

        const sleepDatePickTime = new Date(
            Date.UTC(
                sleepDateTime.getUTCFullYear(),
                sleepDateTime.getUTCMonth(),
                sleepDateTime.getUTCDate(),
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

    useEffect(() => {
        setSleepDuration(calculateSleepDuration());
    }, [wakeupTime, sleepDateTime]);

    const onSleepDateChange = (event: DateTimePickerEvent, date?: Date): void => {
        if (event.type === "dismissed" || event.type === "set") { setShowSleepDateSelector(false); }
        if (date) {
            setSleepDateTime(prev => {
                const newDateTime = new Date(prev || date);
                newDateTime.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                return newDateTime;
            });
        }
    }

    const onSleepTimeChange = (event: DateTimePickerEvent, date?: Date): void => {
        if (event.type === "dismissed" || event.type === "set") { setShowSleepTimeSelector(false); }
        if (date) {
            setSleepDateTime(prev => {
                const newDateTime = new Date(prev || date);
                newDateTime.setHours(date.getHours(), date.getMinutes());
                return newDateTime;
            });
        }
    }

    const onWakeupTimeChange = (event: DateTimePickerEvent, date?: Date): void => {
        if (event.type === "dismissed" || event.type === "set") { setShowWakeupTimeSelector(false); }
        if (date) { setWakeupTime(date); }
    }

    const onSubmit = async () => {
        if (!auth?.currentUser?.uid) { router.push({ pathname: "/register" }); }
        setLoading(true);

        try {
            await addDoc(collection(db, "sleep_tracking"), { user_id: auth?.currentUser?.uid, sleepDateTime, wakeupTime, sleepQuality, sleepDuration });

            // Ressetting Fields.
            setSleepDateTime(new Date());
            setWakeupTime(new Date());
            setSleepQuality(0);
            setSleepDuration(0);
            setShowSleepDateSelector(false);
            setShowSleepTimeSelector(false);
            setShowWakeupTimeSelector(false);
            setLoading(false);
            // Ressetting Fields.
    
            dispatch(setHideDialog());
        }
        catch (error) {
            setLoading(false);
        }
    }

    return (
        <View>
            <View style={styles.trackSleepForm}>
                <View>
                    <Text variant="titleLarge">Last Night's Sleep</Text>
                    {Platform.OS == "android" ?
                        <View style={styles.sleepTimeDateView}>
                            <Button icon="calendar" mode="text" onPress={() => { setShowSleepDateSelector(true); }} disabled={loading} textColor="blue">

                                {` ${sleepDateTime.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", })}`}
                            </Button>
                            {showSleepDateSelector && <DateTimePicker mode="date" value={sleepDateTime} onChange={onSleepDateChange} />}

                            <Button icon="clock" mode="text" onPress={() => { setShowSleepTimeSelector(true); }} disabled={loading} textColor="blue">
                                {` ${sleepDateTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`}
                            </Button>

                            {showSleepTimeSelector && <DateTimePicker mode="time" value={sleepDateTime} onChange={onSleepTimeChange} />}
                        </View> :
                        <View>
                            <DateTimePicker mode="date" value={sleepDateTime} onChange={onSleepDateChange} />
                            <DateTimePicker mode="time" value={sleepDateTime} onChange={onSleepTimeChange} />
                        </View>}

                </View>

                <View>
                    <Text variant="titleLarge">Wakeup Time</Text>
                    {Platform.OS == "android" ?
                        <View>
                            <Button icon="clock" mode="text" onPress={() => { setShowWakeupTimeSelector(true); }} disabled={loading} textColor="blue" style={[{alignSelf: 'flex-start'}]}>
                                {`${wakeupTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`}
                            </Button>
                            {showWakeupTimeSelector && <DateTimePicker mode="time" value={wakeupTime} onChange={onWakeupTimeChange} />}
                        </View> :
                        <View>
                            <DateTimePicker mode="time" value={wakeupTime} onChange={onWakeupTimeChange} />
                        </View>
                    }
                </View>

                <View>
                    <Text variant="titleLarge">Sleep Quality: {sleepQuality}</Text>
                    <Slider style={styles.slider} value={sleepQuality} minimumValue={1} maximumValue={5} step={1} onValueChange={(value: number) => setSleepQuality(value)} disabled={loading} thumbTintColor="tomato" minimumTrackTintColor="blue" />
                </View>
                <Text variant="titleMedium">{`Total Sleeping Hours: ${convertMinutesToHoursAndMinutes(sleepDuration)}`}</Text>
            </View>

            <Divider />
            <View style={styles.formSubmission}>
                <Button mode="text" onPress={() => dispatch(setHideDialog())} disabled={loading} textColor="blue">Cancel</Button>
                <Button mode="contained" onPress={onSubmit} disabled={loading} loading={loading}>Submit</Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    trackSleepForm: {
        paddingVertical: 10
    },
    sleepTimeDateView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    formSubmission: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingTop: 15
    },
    slider: {
        width: '100%',
    }
})