import React, { useMemo, useState } from "react";
import { Button, Text, Avatar, Divider, Surface, Portal, Dialog } from 'react-native-paper';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { SleepDataEntry, SleepDataState } from "../../types/track";
import { deleteSleepData } from "@/store/trackSlice";
import { View, Animated, StyleSheet } from "react-native";
import { setDialog, DialogTab, DialogType } from "@/store/trackDialogSlice";

export default function TrackSleepCard() {
    const dispatch = useDispatch<AppDispatch>();
    const { currentMonth, sleepData, currentDate } = useSelector((state: RootState) => state.track);
    const formattedMonth = `${currentMonth.year}-${currentMonth.month}`;
    const fadeAnim = React.useRef(new Animated.Value(1)).current;
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [selectedSleepId, setSelectedSleepId] = useState<string | null>(null);

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
            return sleepData[formattedMonth].filter((entry: SleepDataEntry) => {
                // Create date object in user's timezone
                const wakeupDate = new Date(entry.wakeup_time);
                // Get user's locale
                const userLocale = Intl.DateTimeFormat().resolvedOptions().locale;
                // Format date in ISO format YYYY-MM-DD in user's timezone
                const localDate = wakeupDate.toLocaleDateString(userLocale, {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }).split('/').reverse().join('-');
                return localDate === currentDate;
            });
        }
        return [];
    }, [sleepData, formattedMonth, currentDate]);

    const handleDeletePress = (sleepId: string) => {
        setSelectedSleepId(sleepId);
        setDeleteDialogVisible(true);
    };

    const handleConfirmDelete = () => {
        if (selectedSleepId) {
            dispatch(deleteSleepData({ currentDate, docId: selectedSleepId }));
        }
        setDeleteDialogVisible(false);
    };

    if (!sleepEntries.length) return null;

    return (
        <View>
            <Portal>
                <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
                    <Dialog.Title>Confirm Delete</Dialog.Title>
                    <Dialog.Content>
                        <Text>Are you sure you want to delete this sleep entry?</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button mode="text" textColor="#666" onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
                        <Button mode="contained" onPress={handleConfirmDelete}>Confirm</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

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
                    <Surface style={styles.surface} elevation={0}>
                        <View style={styles.contentContainer}>
                            <View style={styles.headerContainer}>
                                <Avatar.Icon 
                                    size={40} 
                                    icon="moon-waning-crescent" 
                                    color="#fff" 
                                    style={styles.avatar}
                                />
                                <View style={styles.titleContainer}>
                                    <Text variant="titleLarge" style={styles.title}>
                                        {`Sleep Duration: ${convertMinutesToHoursAndMinutes(sleep.sleep_duration)}`}
                                    </Text>
                                    <Text variant="titleMedium">
                                        {`Sleep Quality: ${sleep.sleep_quality}/5`}
                                    </Text>
                                </View>
                            </View>
                            
                            <View style={[styles.buttonContainer, { width: '50%', alignSelf: 'flex-start' }]}>
                                <Button
                                    mode="contained-tonal"
                                    icon="delete"
                                    onPress={() => sleep.id && handleDeletePress(sleep.id)}
                                    style={styles.button}
                                >
                                    Delete
                                </Button>
                                <Button
                                    mode="contained"
                                    icon="pencil"
                                    onPress={() => dispatch(setDialog({
                                        showDialog: true,
                                        dialogTab: DialogTab.SLEEP,
                                        dialogType: DialogType.EDIT
                                    }))}
                                    style={styles.button}
                                >
                                    Edit
                                </Button>
                            </View>
                        </View>
                    </Surface>
                </Animated.View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    surface: {
        margin: 10,
        borderRadius: 12,
        backgroundColor: '#fff',
        padding: 16
    },
    contentContainer: {
        gap: 16
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    avatar: {
        backgroundColor: '#673AB7'
    },
    titleContainer: {
        flex: 1
    },
    title: {
        fontWeight: '600'
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 8
    },
    button: {
        flex: 1
    }
});