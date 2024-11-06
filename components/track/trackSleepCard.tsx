import React, { useMemo } from "react";
import { Card, Button, Text, Avatar, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { SleepDataEntry, SleepDataState } from "../../types/track";
import { deleteSleepData } from "@/store/trackSlice";
import { View, Animated } from "react-native";
import { setDialog, DialogTab, DialogType } from "@/store/trackDialogSlice";

export default function TrackSleepCard() {
    const dispatch = useDispatch<AppDispatch>();
    const { currentMonth, sleepData, currentDate } = useSelector((state: RootState) => state.track);
    const formattedMonth = `${currentMonth.year}-${currentMonth.month}`;
    const fadeAnim = React.useRef(new Animated.Value(1)).current;
    const LeftContent = (props: any) => <Avatar.Icon {...props} icon="moon-waning-crescent" color="#fff" />;

    React.useEffect(() => {
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, [currentDate]);

    const convertMinutesToHoursAndMinutes = (totalMinutes: number): string =>
        `${Math.floor(totalMinutes / 60)} hours and ${totalMinutes % 60} minutes`;

    const sleepEntries = useMemo(() => {
        if (!Array.isArray(sleepData) && sleepData[formattedMonth]?.length > 0) {
            return sleepData[formattedMonth].filter((entry: SleepDataEntry) =>
                new Date(entry.wakeup_time).toLocaleDateString().split('/').reverse().join('-') === currentDate
            );
        }
        return [];
    }, [sleepData, formattedMonth, currentDate]);

    if (!sleepEntries.length) return null;

    return (
        <View>
            {sleepEntries.map((sleep: SleepDataEntry, index: number) => (
                <Animated.View
                    key={sleep.id || index}
                    style={{
                        opacity: fadeAnim,
                        transform: [{
                            translateY: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [20, 0]
                            })
                        }]
                    }}
                >
                    <Divider />
                    <Card style={{ margin: 10 }}>
                        <Card.Title 
                            title={`Sleep Duration: ${convertMinutesToHoursAndMinutes(sleep.sleep_duration)}`} 
                            subtitle={`Sleep Quality: ${sleep.sleep_quality}/5`} 
                            left={LeftContent} 
                        />
                        <Card.Actions style={{ alignSelf: 'flex-start' }}>
                            <Button 
                                icon="delete" 
                                onPress={() => sleep.id && dispatch(deleteSleepData({ currentDate, docId: sleep.id }))}
                            >
                                Delete
                            </Button>
                            <Button 
                                icon="pencil" 
                                onPress={() => dispatch(setDialog({ 
                                    showDialog: true, 
                                    dialogTab: DialogTab.SLEEP, 
                                    dialogType: DialogType.EDIT 
                                }))}
                            >
                                Edit
                            </Button>
                        </Card.Actions>
                    </Card>
                </Animated.View>
            ))}
        </View>
    );
}