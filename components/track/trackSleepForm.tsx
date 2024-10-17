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
import { Divider, Text, Button, HelperText } from 'react-native-paper';
import { getAuth } from "firebase/auth";
import { SleepDataEntry } from "@/types/track";
import { addSleepData } from "@/store/trackSlice";

export default function TrackSleepForm() {
    const dispatch = useDispatch<AppDispatch>();
    const currentDate = useSelector((state: RootState) => state.track.currentDate);
    const [sleepDateTime, setSleepDateTime] = useState<Date>(() => {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - 1); // Set to the previous day
        date.setHours(22, 0, 0, 0); // Set time to 10:00 AM
        return date;
    });
    const [wakeupTime, setWakeupTime] = useState<Date>(() => {
        const date = new Date(currentDate); // Initialize with the current date
        const now = new Date(); // Get the current time

        // Set the hours, minutes, and seconds to the current time
        date.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

        return date;
    });
    const [sleepQuality, setSleepQuality] = useState<number>(0);
    const [sleepDuration, setSleepDuration] = useState<number>(0);
    const [showSleepDateSelector, setShowSleepDateSelector] = useState<boolean>(false);
    const [showSleepTimeSelector, setShowSleepTimeSelector] = useState<boolean>(false);
    const [showWakeupTimeSelector, setShowWakeupTimeSelector] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [showError, setShowError] = useState<boolean>(false);
    const [errorString, setErrorString] = useState<string | null>(null);
    const sleepData = useSelector((state: RootState) => state.track.sleepData);
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
            // Calculate the difference in milliseconds
            const differenceInMillis = wakeupTime.getTime() - date.getTime();

            // Convert milliseconds to hours
            const differenceInHours = differenceInMillis / (1000 * 60 * 60);
            console.log('differenceInHours', differenceInHours);

            if (differenceInHours < 1) {
                const adjustedWakeupTime = new Date(date.getTime() + (60 * 60 * 1000));
                setWakeupTime(adjustedWakeupTime);
                setSleepDateTime(prev => {
                    const newDateTime = new Date(prev || date);
                    newDateTime.setHours(date.getHours(), date.getMinutes());
                    return newDateTime;
                });
            } else {
                setSleepDateTime(prev => {
                    const newDateTime = new Date(prev || date);
                    newDateTime.setHours(date.getHours(), date.getMinutes());
                    return newDateTime;
                });
            }
        }
    }

    const onWakeupTimeChange = (event: DateTimePickerEvent, date?: Date): void => {
        if (event.type === "dismissed" || event.type === "set") { setShowWakeupTimeSelector(false); }
        if (date) {
            // Calculate the difference in milliseconds
            const differenceInMillis = date.getTime() - sleepDateTime.getTime();

            // Convert milliseconds to hours
            const differenceInHours = differenceInMillis / (1000 * 60 * 60);

            if (differenceInHours < 1) {
                // Otherwise, adjust sleep time by subtracting one hour
                const adjustedSleepTime = new Date(date.getTime() - (60 * 60 * 1000));
                setSleepDateTime(adjustedSleepTime);
                setWakeupTime(date);
            } else {
                // If the sleepDateTime is less than 1 hour from the date, set only wakeup time
                setWakeupTime(date);
            }
        }
    }

    const onSubmit = async () => {
        const [year, month] = currentDate.split('-');
        const formattedMonth = `${year}-${month}`;
        const waterDataForMonth = sleepData?.[formattedMonth] || [];

        setShowError(false);
        setErrorString(null);

        const existingEntry = waterDataForMonth.find(
            entry => new Date(entry.wakeup_time).toLocaleDateString().split('/').reverse().join('-') === currentDate
        );

        if (existingEntry) {
            setShowError(true);
            setErrorString('Sleep data already exists!');
            return;
        }

        if (auth?.currentUser?.uid) {
            setLoading(true);
            
            try {
                let addSleep: SleepDataEntry = { user_id: auth.currentUser.uid, bed_time: sleepDateTime, wakeup_time: wakeupTime, sleep_quality: sleepQuality, sleep_duration: sleepDuration }
                dispatch(addSleepData({currentDate: currentDate, addSleep: addSleep}));

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
            } catch (error) { setLoading(false); }
        } else { router.push({ pathname: "/register" }); }
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
                            {showSleepDateSelector && <DateTimePicker mode="date" value={sleepDateTime} onChange={onSleepDateChange} maximumDate={new Date(currentDate)} minimumDate={new Date(new Date(currentDate).setDate(new Date(currentDate).getDate() - 1))} />}

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
                            <Button icon="clock" mode="text" onPress={() => { setShowWakeupTimeSelector(true); }} disabled={loading} textColor="blue" style={[{ alignSelf: 'flex-start' }]}>
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

            {showError && <HelperText type="error" visible={showError}>{errorString}</HelperText>}
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