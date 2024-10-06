import React, { useEffect, useState } from "react";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { StyleSheet, Text, Platform, Pressable, View } from "react-native";
import Slider from "@react-native-community/slider";

interface TrackSleepFormProps {
    currentDate: string;
}

export default function TrackSleepForm({ currentDate }: TrackSleepFormProps) {
    const [sleepDateTime, setSleepDateTime] = useState(new Date());
    const [wakeupTime, setWakeupTime] = useState(new Date());
    const [sleepQuality, setSleepQuality] = useState(0);
    const [sleepDuration, setSleepDuration] = useState(0);
    const [showSleepDateSelector, setShowSleepDateSelector] = useState(false);
    const [showSleepTimeSelector, setShowSleepTimeSelector] = useState(false);
    const [showWakeupTimeSelector, setShowWakeupTimeSelector] = useState(false);

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

    return (
        <View style={styles.trackSleepForm}>
            <View>
                <Text style={styles.lastNightSleepHeading}>Last Night's Sleep</Text>
                {Platform.OS == "android" ?
                    <View style={styles.sleepTimeDateView}>
                        <Pressable onPress={() => { setShowSleepDateSelector(true); }}>
                            <Text style={styles.sleepDateText}>{` ${sleepDateTime.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", })}`}</Text>
                        </Pressable>
                        {showSleepDateSelector && <DateTimePicker mode="date" value={sleepDateTime} onChange={onSleepDateChange} />}
                        <Pressable onPress={() => { setShowSleepTimeSelector(true); }} >
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
                        <Pressable onPress={() => { setShowWakeupTimeSelector(true); }} >
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
                <Slider value={sleepQuality} minimumValue={1} maximumValue={5} step={1} onValueChange={(value: number) => setSleepQuality(value)} />
            </View>
            <Text>{`Total Sleeping Hours: ${convertMinutesToHoursAndMinutes(sleepDuration)}`}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    trackSleepForm:  {
        paddingVertical: 30,
        backgroundColor: 'white'
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
    }
})