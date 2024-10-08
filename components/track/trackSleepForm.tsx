import React, { useEffect, useState } from "react";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { StyleSheet, Text, Platform, Pressable, View, ActivityIndicator } from "react-native";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useDispatch, useSelector } from "react-redux";
import { setHideDialog } from "@/store/trackDialogSlice";
import { RootState } from "@/store/store";
import { Divider } from 'react-native-paper';

export default function TrackSleepForm() {
    const dispatch = useDispatch();
    const currentDate = useSelector((state: RootState) => state.track.currentDate);
    const userId = useSelector((state: RootState) => state.user.userId);
    const [sleepDateTime, setSleepDateTime] = useState(new Date(new Date(currentDate).setDate(new Date(currentDate).getDate() - 1)));
    const [wakeupTime, setWakeupTime] = useState(new Date(currentDate));
    const [sleepQuality, setSleepQuality] = useState(0);
    const [sleepDuration, setSleepDuration] = useState(0);
    const [showSleepDateSelector, setShowSleepDateSelector] = useState(false);
    const [showSleepTimeSelector, setShowSleepTimeSelector] = useState(false);
    const [showWakeupTimeSelector, setShowWakeupTimeSelector] = useState(false);
    const [loading, setLoading] = useState(false);

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
        if (!userId) { router.push({ pathname: "/(signup)" }); }
        setLoading(true);
        await addDoc(collection(db, "sleep_tracking"), { user_id: userId, sleepDateTime, wakeupTime, sleepQuality, sleepDuration });

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

    return (
        <View>

            <View style={styles.trackSleepForm}>
                <View>
                    <Text style={styles.lastNightSleepHeading}>Last Night's Sleep</Text>
                    {Platform.OS == "android" ?
                        <View style={styles.sleepTimeDateView}>
                            <Pressable onPress={() => { setShowSleepDateSelector(true); }} disabled={loading}>
                                <Text style={styles.sleepDateText}>{` ${sleepDateTime.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", })}`}</Text>
                            </Pressable>
                            {showSleepDateSelector && <DateTimePicker mode="date" value={sleepDateTime} onChange={onSleepDateChange} />}
                            <Pressable onPress={() => { setShowSleepTimeSelector(true); }} disabled={loading}>
                                <Text style={styles.sleepTimeText}> {` ${sleepDateTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`}</Text>
                            </Pressable>
                            {showSleepTimeSelector && <DateTimePicker mode="time" value={sleepDateTime} onChange={onSleepTimeChange} />}
                        </View> :
                        <View>
                            <DateTimePicker mode="date" value={sleepDateTime} onChange={onSleepDateChange} />
                            <DateTimePicker mode="time" value={sleepDateTime} onChange={onSleepTimeChange} />
                        </View>}

                </View>

                <View>
                    <Text>Wakeup Time</Text>
                    {Platform.OS == "android" ?
                        <View>
                            <Pressable onPress={() => { setShowWakeupTimeSelector(true); }} disabled={loading}>
                                <Text style={styles.wakeupTimeText}> {` ${wakeupTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`}</Text>
                            </Pressable>
                            {showWakeupTimeSelector && <DateTimePicker mode="time" value={wakeupTime} onChange={onWakeupTimeChange} />}
                        </View> :
                        <View>
                            <DateTimePicker mode="time" value={wakeupTime} onChange={onWakeupTimeChange} />
                        </View>
                    }
                </View>

                <View>
                    <Text>Sleep Quality: {sleepQuality}</Text>
                    <Slider value={sleepQuality} minimumValue={1} maximumValue={5} step={1} onValueChange={(value: number) => setSleepQuality(value)} disabled={loading}/>
                </View>
                <Text>{`Total Sleeping Hours: ${convertMinutesToHoursAndMinutes(sleepDuration)}`}</Text>
            </View>

            <Divider />
            <View style={styles.formSubmission}>
                <Pressable onPress={() => dispatch(setHideDialog())} disabled={loading}>
                    <Text style={styles.cancelButton}>Cancel</Text>
                </Pressable>
                <Pressable onPress={onSubmit} style={styles.submitButton} disabled={loading}>
                    <Text style={styles.submitButtonText}>{loading ? 'Loading...' : 'Submit'}</Text>
                    {loading && <ActivityIndicator color={'white'} />}
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    trackSleepForm: {
        paddingVertical: 30,
        // backgroundColor: 'white'
    },
    lastNightSleepHeading: {
        fontWeight: '700',
    },
    sleepTimeDateView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    sleepDateText: {
        color: 'blue'
    },
    sleepTimeText: {
        color: 'blue'
    },
    wakeupTimeText: {
        marginBottom: 10,
        color: 'blue'
    },
    formSubmission: {
        flexDirection: 'row',
        // backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingVertical: 10
    },
    cancelButton: {
        color: 'blue',
        textTransform: 'uppercase',
        fontSize: 16
    },
    submitButton: {
        flexDirection: 'row',
        backgroundColor: 'red',
        paddingVertical: 7,
        paddingHorizontal: 15,
        borderRadius: 3,
        marginLeft: 15,
        alignItems: 'center',
        justifyContent: 'center'
    },
    submitButtonText: {
        color: 'white',
        fontWeight: '700',
        textTransform: 'uppercase',
        marginRight: 5
    }
})