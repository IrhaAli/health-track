import React, { useEffect, useState } from "react";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { StyleSheet, Platform, Pressable, View, ActivityIndicator, TouchableOpacity } from "react-native";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useDispatch, useSelector } from "react-redux";
import { DialogType, setDialog } from "@/store/trackDialogSlice";
import { AppDispatch, RootState } from "@/store/store";
import { Divider, Text, Button, HelperText, Surface } from 'react-native-paper';
import { isSleepDataEntry, SleepDataEntry } from "@/types/track";
import { addSleepData, updateSleepData } from "@/store/trackSlice";
import { clearImageURI } from "@/store/cameraSlice";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TrackSleepForm() {
    const dispatch = useDispatch<AppDispatch>();
    const currentDate = useSelector((state: RootState) => state.track.currentDate);
    const [sleepDateTime, setSleepDateTime] = useState<Date>(() => {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - 1); // Set to the previous day
        date.setHours(22, 0, 0, 0); // Set time to 10:00 PM
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
    const [currentSleepData, setCurrentSleepData] = useState<SleepDataEntry | {}>({});
    const dialogType: DialogType | null = useSelector((state: RootState) => state.trackDialog.dialogType);
    const [currentUser, setCurrentUser] = useState<any>(null);

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

    const convertMinutesToHoursAndMinutes = (totalMinutes: number): string =>
        `${Math.floor(totalMinutes / 60)} hours and ${totalMinutes % 60} minutes`;

    const calculateSleepDuration = () => {
        // Convert both times to UTC timestamps for comparison
        const sleepTimeMs = sleepDateTime.getTime();
        const wakeupTimeMs = wakeupTime.getTime();
        
        // Handle case where sleep time is after wakeup time (crosses midnight)
        let differenceMs = wakeupTimeMs - sleepTimeMs;
        if (differenceMs < 0) {
            // Add 24 hours worth of milliseconds
            differenceMs += 24 * 60 * 60 * 1000;
        }
        
        const differenceMinutes = Math.floor(differenceMs / (1000 * 60));
        return differenceMinutes;
    };

    const getSleepDataObject = (): SleepDataEntry | {} => {
        const [year, month] = currentDate.split('-');
        const formattedMonth = `${year}-${month}`;

        if (!Array.isArray(sleepData)) {
            if (formattedMonth in sleepData) {
                if (sleepData[formattedMonth] && sleepData[formattedMonth].length > 0) {

                    const entry = sleepData[formattedMonth].find((entry: SleepDataEntry) => new Date(entry.wakeup_time).toLocaleDateString().split('/').reverse().join('-') === currentDate);
                    if (entry) { return entry; }
                }
            }
        }
        return {}; // Return an empty object if conditions are not met
    }

    useEffect(() => {
        if (dialogType === DialogType.EDIT) {
            const entry: SleepDataEntry | {} = getSleepDataObject();
            if (entry && isSleepDataEntry(entry)) {
                setCurrentSleepData(entry);
                setSleepDateTime(new Date(entry.bed_time));
                setWakeupTime(new Date(entry.wakeup_time))
                setSleepQuality(entry.sleep_quality)
            }
        }
    }, [dialogType, currentDate, sleepData]); // Dependencies to re-run the effect

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
        const sleepDataForMonth = sleepData?.[formattedMonth] || [];

        setShowError(false);
        setErrorString(null);

        const existingEntry = sleepDataForMonth.find(
            entry => new Date(entry.wakeup_time).toLocaleDateString().split('/').reverse().join('-') === currentDate
        );

        if (dialogType !== DialogType.EDIT && existingEntry) {
            setShowError(true);
            setErrorString('Sleep data already exists!');
            return;
        }

        if (dialogType === DialogType.EDIT && !existingEntry) {
            setShowError(true);
            setErrorString("Sleep data doesn't exists, add water first!");
            return;
        }

        if (currentUser?.uid) {
            setLoading(true);

            try {
                if (dialogType !== DialogType.EDIT) {
                    let addSleep: SleepDataEntry = { user_id: currentUser.uid, bed_time: sleepDateTime, wakeup_time: wakeupTime, sleep_quality: sleepQuality, sleep_duration: sleepDuration }
                    dispatch(addSleepData({ currentDate: currentDate, addSleep: addSleep }));
                }
                if (dialogType === DialogType.EDIT && isSleepDataEntry(currentSleepData)) {
                    let updateSleep: SleepDataEntry = { ...currentSleepData, bed_time: sleepDateTime, wakeup_time: wakeupTime, sleep_quality: sleepQuality, sleep_duration: sleepDuration }
                    dispatch(updateSleepData({ updateSleep, currentDate }))
                }

                // Ressetting Fields.
                setSleepDateTime(new Date());
                setWakeupTime(new Date());
                setSleepQuality(0);
                setSleepDuration(0);
                setShowSleepDateSelector(false);
                setShowSleepTimeSelector(false);
                setShowWakeupTimeSelector(false);
                setLoading(false);
                dispatch(clearImageURI());
                // Ressetting Fields.

                dispatch(setDialog({ showDialog: false, dialogTab: null, dialogType: null }));
            } catch (error) { setLoading(false); }
        } else { router.push({ pathname: "/register" }); }
    }

    return (
        <View>
            <View style={styles.trackSleepForm}>
                <View style={styles.section}>
                    <Text variant="titleLarge" style={styles.sectionTitle}>Last Night's Sleep</Text>
                    <Surface style={styles.dateTimeContainer} elevation={1}>
                        <TouchableOpacity 
                            style={styles.dateTimeButton}
                            onPress={() => setShowSleepDateSelector(true)}
                            disabled={loading}
                        >
                            <View style={styles.dateTimeContent}>
                                <Text variant="titleMedium" style={styles.dateTimeLabel}>Date</Text>
                                <View style={styles.dateTimeValue}>
                                    <Text variant="bodyLarge" style={styles.dateTimeText}>
                                        {sleepDateTime.toLocaleDateString("en-US", { 
                                            month: "short", 
                                            day: "numeric", 
                                            year: "numeric"
                                        })}
                                    </Text>
                                    <Text variant="titleSmall" style={styles.iconText}>📅</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.dateTimeButton}
                            onPress={() => setShowSleepTimeSelector(true)}
                            disabled={loading}
                        >
                            <View style={styles.dateTimeContent}>
                                <Text variant="titleMedium" style={styles.dateTimeLabel}>Time</Text>
                                <View style={styles.dateTimeValue}>
                                    <Text variant="bodyLarge" style={styles.dateTimeText}>
                                        {sleepDateTime.toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true
                                        })}
                                    </Text>
                                    <Text variant="titleSmall" style={styles.iconText}>🕐</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Surface>

                    {showSleepDateSelector && (
                        <DateTimePicker
                            mode="date"
                            value={sleepDateTime}
                            onChange={onSleepDateChange}
                            maximumDate={new Date(currentDate)}
                            minimumDate={new Date(new Date(currentDate).setDate(new Date(currentDate).getDate() - 1))}
                        />
                    )}
                    {showSleepTimeSelector && (
                        <DateTimePicker
                            mode="time"
                            value={sleepDateTime}
                            onChange={onSleepTimeChange}
                        />
                    )}
                </View>

                <View style={styles.section}>
                    <Text variant="titleLarge" style={styles.sectionTitle}>Wakeup Time</Text>
                    <Surface style={styles.dateTimeContainer} elevation={1}>
                        <TouchableOpacity
                            style={[styles.dateTimeButton, { flex: 1 }]}
                            onPress={() => setShowWakeupTimeSelector(true)}
                            disabled={loading}
                        >
                            <View style={styles.dateTimeContent}>
                                <Text variant="titleMedium" style={styles.dateTimeLabel}>Time</Text>
                                <View style={styles.dateTimeValue}>
                                    <Text variant="bodyLarge" style={styles.dateTimeText}>
                                        {wakeupTime.toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true
                                        })}
                                    </Text>
                                    <Text variant="titleSmall" style={styles.iconText}>⏰</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Surface>

                    {showWakeupTimeSelector && (
                        <DateTimePicker
                            mode="time"
                            value={wakeupTime}
                            onChange={onWakeupTimeChange}
                        />
                    )}
                </View>

                <View style={styles.section}>
                    <Text variant="titleLarge" style={styles.sectionTitle}>Sleep Quality: {sleepQuality}</Text>
                    <Surface style={styles.sliderContainer} elevation={1}>
                        <Slider
                            style={styles.slider}
                            value={sleepQuality}
                            minimumValue={1}
                            maximumValue={5}
                            step={1}
                            onValueChange={(value: number) => setSleepQuality(value)}
                            disabled={loading}
                            thumbTintColor="#6200ee"
                            minimumTrackTintColor="#6200ee"
                        />
                        <View style={styles.qualityLabels}>
                            <Text>Poor</Text>
                            <Text>Excellent</Text>
                        </View>
                    </Surface>
                    <Text variant="titleMedium" style={styles.durationText}>
                        Total Sleep: {convertMinutesToHoursAndMinutes(sleepDuration)}
                    </Text>
                </View>
            </View>

            <Divider />
            <View style={styles.formSubmission}>
                <Button 
                    mode="text" 
                    onPress={() => {
                        dispatch(setDialog({ showDialog: false, dialogTab: null, dialogType: null }));
                        dispatch(clearImageURI());
                    }}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button 
                    mode="contained" 
                    onPress={onSubmit} 
                    disabled={loading} 
                    loading={loading}
                    style={styles.button}
                >
                    {dialogType === DialogType.EDIT ? 'Update' : 'Submit'}
                </Button>
            </View>

            {showError && (
                <HelperText type="error" visible={showError}>
                    {errorString}
                </HelperText>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    trackSleepForm: {
        paddingVertical: 16,
        gap: 24
    },
    section: {
        gap: 12
    },
    sectionTitle: {
        fontWeight: '600',
        marginBottom: 4
    },
    dateTimeContainer: {
        flexDirection: 'row',
        borderRadius: 12,
        overflow: 'hidden'
    },
    dateTimeButton: {
        flex: 0.5,
        padding: 12,
        borderRightWidth: 1,
        borderRightColor: '#e0e0e0'
    },
    dateTimeContent: {
        gap: 4
    },
    dateTimeLabel: {
        color: '#666',
        fontSize: 14
    },
    dateTimeValue: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    dateTimeText: {
        color: '#1a1a1a',
        fontWeight: '500'
    },
    iconText: {
        fontSize: 16
    },
    sliderContainer: {
        padding: 16,
        borderRadius: 12
    },
    slider: {
        width: '100%',
        height: 40
    },
    qualityLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginTop: 4
    },
    durationText: {
        textAlign: 'center',
        marginTop: 8,
        color: '#6200ee'
    },
    formSubmission: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        paddingTop: 16
    },
    button: {
        borderRadius: 8,
        minWidth: 100
    }
});