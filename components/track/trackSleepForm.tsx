import React, { useEffect, useState } from "react";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
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
    const { currentDate, sleepData } = useSelector((state: RootState) => state.track);
    const dialogType = useSelector((state: RootState) => state.trackDialog.dialogType);

    const [sleepDateTime, setSleepDateTime] = useState(() => {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - 1);
        date.setHours(22, 0, 0, 0);
        return date;
    });

    const [wakeupTime, setWakeupTime] = useState(() => {
        const date = new Date(currentDate);
        const now = new Date();
        date.setHours(now.getHours(), now.getMinutes(), 0, 0);
        return date;
    });

    const [sleepQuality, setSleepQuality] = useState(0);
    const [sleepDuration, setSleepDuration] = useState(0);
    const [showSleepDateSelector, setShowSleepDateSelector] = useState(false);
    const [showSleepTimeSelector, setShowSleepTimeSelector] = useState(false);
    const [showWakeupTimeSelector, setShowWakeupTimeSelector] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorString, setErrorString] = useState<string | null>(null);
    const [currentSleepData, setCurrentSleepData] = useState<SleepDataEntry | {}>({});
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        AsyncStorage.getItem('session').then(userString => {
            if (userString) setCurrentUser(JSON.parse(userString));
        });
    }, []);

    const convertMinutesToHoursAndMinutes = (mins: number) => 
        `${Math.floor(mins / 60)} hours and ${mins % 60} minutes`;

    const calculateSleepDuration = () => {
        let diff = wakeupTime.getTime() - sleepDateTime.getTime();
        if (diff < 0) diff += 24 * 60 * 60 * 1000;
        return Math.floor(diff / (1000 * 60));
    };

    const getSleepDataObject = (): SleepDataEntry | {} => {
        const [year, month] = currentDate.split('-');
        const monthData = sleepData[`${year}-${month}`];
        if (!monthData?.length) return {};
        
        const entry = monthData.find(entry => 
            new Date(entry.wakeup_time).toLocaleDateString().split('/').reverse().join('-') === currentDate
        );
        return entry || {};
    };

    useEffect(() => {
        if (dialogType === DialogType.EDIT) {
            const entry = getSleepDataObject();
            if (isSleepDataEntry(entry)) {
                setCurrentSleepData(entry);
                setSleepDateTime(new Date(entry.bed_time));
                setWakeupTime(new Date(entry.wakeup_time));
                setSleepQuality(entry.sleep_quality);
            }
        }
    }, [dialogType, currentDate, sleepData]);

    useEffect(() => {
        setSleepDuration(calculateSleepDuration());
    }, [wakeupTime, sleepDateTime]);

    const handleTimeChange = (setter: Function, otherTime: Date, minGap = 60) => 
        (event: DateTimePickerEvent, date?: Date) => {
            if (!date) return;
            const diffHours = Math.abs(date.getTime() - otherTime.getTime()) / (1000 * 60 * 60);
            
            if (diffHours < 1) {
                const adjustment = minGap * 60 * 1000;
                const adjustedTime = new Date(date.getTime() + adjustment);
                setter(adjustedTime);
            }
            setter(date);
        };

    const onSubmit = async () => {
        if (!currentUser?.uid) {
            router.push("/register");
            return;
        }

        const [year, month] = currentDate.split('-');
        const monthData = sleepData[`${year}-${month}`] || [];
        const existingEntry = monthData.find(entry => 
            new Date(entry.wakeup_time).toLocaleDateString().split('/').reverse().join('-') === currentDate
        );

        if ((dialogType !== DialogType.EDIT && existingEntry) || 
            (dialogType === DialogType.EDIT && !existingEntry)) {
            setShowError(true);
            setErrorString(dialogType !== DialogType.EDIT ? 
                'Sleep data already exists!' : 
                "Sleep data doesn't exist, add sleep first!"
            );
            return;
        }

        setLoading(true);
        try {
            const sleepEntry = {
                user_id: currentUser.uid,
                bed_time: sleepDateTime,
                wakeup_time: wakeupTime,
                sleep_quality: sleepQuality,
                sleep_duration: sleepDuration
            };

            if (dialogType === DialogType.EDIT && isSleepDataEntry(currentSleepData)) {
                dispatch(updateSleepData({ 
                    updateSleep: { ...currentSleepData, ...sleepEntry }, 
                    currentDate 
                }));
            } else {
                dispatch(addSleepData({ 
                    currentDate, 
                    addSleep: sleepEntry 
                }));
            }

            dispatch(clearImageURI());
            dispatch(setDialog({ showDialog: false, dialogTab: null, dialogType: null }));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

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
                            onChange={(e, d) => {
                                setShowSleepDateSelector(false);
                                if (d) setSleepDateTime(d);
                            }}
                            maximumDate={new Date(currentDate)}
                            minimumDate={new Date(new Date(currentDate).setDate(new Date(currentDate).getDate() - 1))}
                        />
                    )}
                    {showSleepTimeSelector && (
                        <DateTimePicker
                            mode="time"
                            value={sleepDateTime}
                            onChange={handleTimeChange(setSleepDateTime, wakeupTime)}
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
                            onChange={handleTimeChange(setWakeupTime, sleepDateTime, -60)}
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
                            onValueChange={setSleepQuality}
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